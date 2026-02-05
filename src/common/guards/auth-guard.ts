import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import { PUBLIC_ROUTE } from '../decorators/public.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_ROUTE,
      context.getHandler(),
    )

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      throw new UnauthorizedException('Please authenticate')
    }

    try {
      const user = await this.jwtService.verifyAsync(token)
      request.user = user
      return true
    } catch {
      throw new UnauthorizedException('Please authenticate')
    }
  }
}
