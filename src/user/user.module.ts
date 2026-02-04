import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { User } from './entities/user.entity'
import { TokenModule } from 'src/token/token.module'
import { EmailModule } from 'src/email/email.module'
import { WalletModule } from 'src/wallet/wallet.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PasswordModule } from 'src/password/password.module'
import { OtpModule } from 'src/otp/otp.module'
import { AuditLogModule } from 'src/audit-logs/audit-logs.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    TokenModule,
    WalletModule,
    TokenModule,
    OtpModule,
    PasswordModule,
    AuditLogModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
