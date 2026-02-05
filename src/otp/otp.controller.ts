import { Controller, Post, Body } from '@nestjs/common'
import { OtpService } from './otp.service'
import { VerifyOtpDto } from './dto/verify-otp.dto'
import { User } from 'src/user/entities/user.entity'
import { Public } from 'src/common'

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('generate')
  @Public()
  async generateOtp(@Body() body: { user: User }) {
    return this.otpService.generateOtp(body.user)
  }

  @Post('verify')
  @Public()
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(dto.userId, dto.code)
    return { valid: isValid }
  }
}
