import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common'
import { TokenService, JwtPayload } from './token.service'
import { TokenType } from './entities/token.entity'
import { User } from 'src/user/entities/user.entity'
import { AuthGuard } from 'src/guard/auth-guard'

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}
  @UseGuards(AuthGuard)
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
