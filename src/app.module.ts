import { Module } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user/entities/user.entity'
import { EmailModule } from './email/email.module'
import { TokenModule } from './token/token.module'
import { WalletModule } from './wallet/wallet.module'
import { BullModule } from '@nestjs/bull'
import { OtpModule } from './otp/otp.module'
import { PasswordModule } from './password/password.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Token } from './token/entities/token.entity'
import { Wallet } from './wallet/entities/wallet.entity'
import { Transaction } from './transaction/entities/transaction.entity'
import { Otp } from './otp/entities/otp.entity'
import { Password } from './password/entities/password.entity'
import { JwtModule } from '@nestjs/jwt'
import { AuditLogModule } from './audit-logs/audit-logs.module'
import { AuditLog } from './audit-logs/entities/audit-log.entity'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '1h') as any,
        },
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE-HOST'),
        port: config.get<number>('DATABASE-PORT'),
        username: config.get<string>('DATABASE-USERNAME'),
        password: config.get<string>('DATABASE-PASSWORD'),
        database: config.get<string>('DATABASE-NAME'),
        entities: [User, Token, Wallet, Transaction, Otp, Password, AuditLog],
        synchronize: true,
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS-HOST'),
          port: config.get<number>('REDIS-PORT'),
        },
      }),
    }),

    UserModule,
    EmailModule,
    TokenModule,
    WalletModule,
    OtpModule,
    PasswordModule,
    AuditLogModule,
  ],
})
export class AppModule {}
