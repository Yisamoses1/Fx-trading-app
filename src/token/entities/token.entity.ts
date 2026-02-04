// token.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { User } from '../../user/entities/user.entity'

export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  token: string

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  tokenType: TokenType

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  user: User
}
