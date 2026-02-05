import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Req,
} from '@nestjs/common'
import { TokenService } from './token.service'
import { TokenType } from './entities/token.entity'
import { User } from 'src/user/entities/user.entity'

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const payload = await this.tokenService.findAndVerifyToken(
      body.refreshToken,
      TokenType.REFRESH,
    )
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
    return this.tokenService.createAccessRefreshToken({
      id: payload.userId,
    } as User)
  }
  @Post('logout')
  async logout(@Req() req) {
    return this.tokenService.deleteToken(req.user.userId, TokenType.REFRESH)
  }
}
