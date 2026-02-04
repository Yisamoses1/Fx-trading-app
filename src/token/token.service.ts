import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Token, TokenType } from './entities/token.entity'
import { User } from 'src/user/entities/user.entity'

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(userId: string, expiresIn: string, tokenType: TokenType) {
    const secret = this.configService.get<string>('JWT_SECRET')
    return this.jwtService.sign(
      { userId, tokenType },
      { secret, expiresIn: expiresIn as any },
    )
  }

  async deleteToken(userId: string, tokenType: TokenType) {
    const result = await this.tokenRepository.delete({
      user: { id: userId },
      tokenType,
    })
    console.log(`${result.affected} tokens deleted`)
    return result
  }

  async createAccessRefreshToken(user: User) {
    const accessToken = await this.generateToken(
      user.id,
      '15m',
      TokenType.ACCESS,
    )
    const refreshToken = await this.generateToken(
      user.id,
      '30d',
      TokenType.REFRESH,
    )

    await this.deleteToken(user.id, TokenType.REFRESH)

    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + 30)

    await this.tokenRepository.save({
      token: refreshToken,
      tokenType: TokenType.REFRESH,
      user,
    })

    return { accessToken, refreshToken }
  }

  async findAndVerifyToken(
    token: string,
    tokenType: TokenType,
  ): Promise<any | null> {
    const storedToken = await this.tokenRepository.findOne({
      where: { token, tokenType },
      relations: ['user'],
    })
    if (!storedToken) return null

    const secret = this.configService.get<string>('JWT_SECRET')
    try {
      return this.jwtService.verify(token, { secret })
    } catch {
      return null
    }
  }
}
