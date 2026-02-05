import { Controller, Post, Body } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { Public } from 'src/common'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @Public()
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto)
  }

  @Post('verify-email')
  @Public()
  async verifyEmail(@Body() payload: { email: string; code: string }) {
    return this.userService.verifyEmail(payload.email, payload.code)
  }

  @Post('login')
  @Public()
  async login(@Body() payload: { email: string; password: string }) {
    return this.userService.signIn(payload.email, payload.password)
  }
}
