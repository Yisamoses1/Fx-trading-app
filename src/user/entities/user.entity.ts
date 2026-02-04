import { Otp } from 'src/otp/entities/otp.entity'
import { Password } from 'src/password/entities/password.entity'
import { Token } from 'src/token/entities/token.entity'
import { Wallet } from 'src/wallet/entities/wallet.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ default: false })
  verified: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[]

  @OneToMany(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallets: Wallet[]

  @OneToMany(() => Otp, (otp) => otp.user, { cascade: true })
  otps: Otp[]

  @OneToMany(() => Password, (password) => password.user, { cascade: true })
  passwords: Password[]
}
