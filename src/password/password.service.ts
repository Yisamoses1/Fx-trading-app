import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThan } from 'typeorm'
import { Password } from './entities/password.entity'
import { User } from 'src/user/entities/user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(Password)
    private readonly passwordRepository: Repository<Password>,
  ) {}

  async storePassword(user: User, plainPassword: string) {
    const hash = await bcrypt.hash(plainPassword, 10)
    const password = this.passwordRepository.create({ hash, user })
    return this.passwordRepository.save(password)
  }

  async clearExpiredPasswords() {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    await this.passwordRepository.delete({ createdAt: LessThan(oneYearAgo) })
  }

  async getUserPasswords(user: User) {
    return this.passwordRepository.find({ where: { user } })
  }
}
