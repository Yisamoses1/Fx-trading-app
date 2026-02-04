import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm'
import { User } from 'src/user/entities/user.entity'

@Entity()
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  code: string

  @Column()
  expiresAt: Date

  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  user: User

  @CreateDateColumn()
  createdAt: Date
}
