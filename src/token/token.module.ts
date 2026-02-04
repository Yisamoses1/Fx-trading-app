import { Module } from '@nestjs/common'
import { TokenService } from './token.service'
import { TokenController } from './token.controller'
import { Token } from './entities/token.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [TypeOrmModule.forFeature([Token]), JwtModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
