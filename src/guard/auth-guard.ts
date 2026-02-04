import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']
    const token = authHeader?.replace('Bearer ', '')

    if (!token) throw new UnauthorizedException('Please authenticate')

    try {
      const user = await this.jwtService.verifyAsync(token)
      request.user = user
      return true
    } catch {
      throw new UnauthorizedException('Please authenticate')
    }
  }
}
