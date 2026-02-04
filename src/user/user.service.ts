import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { EmailService } from 'src/email/email.service'
import { TokenService } from 'src/token/token.service'
import { WalletService } from 'src/wallet/wallet.service'
import { OtpService } from 'src/otp/otp.service'
import { PasswordService } from 'src/password/password.service'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly walletService: WalletService,
    private readonly otpService: OtpService,
    private readonly passwordService: PasswordService,
  ) {}

  async signUp(payload: CreateUserDto) {
    const user = await this.userRepository.findOneBy({ email: payload.email })
    if (user) {
      throw new BadRequestException('User with this email already exists')
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10)

    const newUser = this.userRepository.create({
      ...payload,
      password: hashedPassword,
      verified: false,
    })

    await this.userRepository.save(newUser)
    await this.passwordService.storePassword(newUser, payload.password)

    const otp = await this.otpService.generateOtp(newUser)

    await this.emailService.sendTemplateEmail(
      'yisarasaq2018@gmail.com',
      '"Welcome to FX Trading App" <noreply@yourdomain.com>',
      'otp',
      {
        firstName: newUser.firstName,
        otp: otp.code,
      },
    )
    const { password, ...userWithoutPassword } = newUser

    return {
      message: 'User registered successfully. OTP sent to email.',
      user: userWithoutPassword,
    }
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userRepository.findOneBy({ email })
    if (!user) {
      throw new BadRequestException('User not found')
    }

    const verified = await this.otpService.verifyOtp(user.id, code)

    if (!verified) {
      throw new BadRequestException('Invalid or expired OTP')
    }

    user.verified = true
    await this.userRepository.save(user)

    await this.walletService.createWalletForUser(user)

    await this.emailService.sendTemplateEmail(
      'yisarasaq2018@gmail.com',
      'Email Verified',
      'verified',
      {
        firstName: user.firstName,
      },
    )

    return { message: 'Email verified successfully' }
  }

  async signIn(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email })
    if (!user) {
      throw new BadRequestException('User not found')
    }

    if (!user.verified) {
      throw new BadRequestException('Email not verified')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password')
    }

    const { password: _, ...userWithoutPassword } = user

    const tokenData = await this.tokenService.createAccessRefreshToken(user)
    const { accessToken, refreshToken } = tokenData

    return {
      message: 'User signed in successfully',
      user: userWithoutPassword,
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }
}
