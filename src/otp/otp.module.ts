import { Module } from '@nestjs/common'
import { OtpService } from './otp.service'
import { OtpController } from './otp.controller'
import { Otp } from './entities/otp.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [TypeOrmModule.forFeature([Otp])],
  controllers: [OtpController],
  providers: [OtpService, ConfigService],
  exports: [OtpService],
})
export class OtpModule {}
