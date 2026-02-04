import { Controller, Post, Body } from '@nestjs/common'
import { OtpService } from './otp.service'
import { VerifyOtpDto } from './dto/verify-otp.dto'
import { User } from 'src/user/entities/user.entity'

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('generate')
  async generateOtp(@Body() body: { user: User }) {
    return this.otpService.generateOtp(body.user)
  }

  @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(dto.userId, dto.code)
    return { valid: isValid }
  }
}
