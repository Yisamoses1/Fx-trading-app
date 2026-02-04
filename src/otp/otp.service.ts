import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Otp } from './entities/otp.entity'
import { User } from 'src/user/entities/user.entity'

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async generateOtp(user: User): Promise<Otp> {
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    const otp = this.otpRepository.create({ code, expiresAt, user })
    return this.otpRepository.save(otp)
  }

  async verifyOtp(userId: string, code: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { user: { id: userId }, code },
      relations: ['user'],
    })

    if (!otp) {
      throw new BadRequestException('Invalid OTP')
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired')
    }

    // OTP is valid → delete it so it can't be reused
    await this.otpRepository.delete(otp.id)

    return true
  }
}
