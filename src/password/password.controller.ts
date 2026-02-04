import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { PasswordService } from './password.service'
import { CreatePasswordDto } from './dto/create-password.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'

@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}
}
