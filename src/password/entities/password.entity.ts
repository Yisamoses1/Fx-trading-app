import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm'
import { User } from 'src/user/entities/user.entity'

@Entity('passwords')
export class Password {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  hash: string

  @ManyToOne(() => User, (user) => user.passwords, { onDelete: 'CASCADE' })
  user: User

  @CreateDateColumn()
  createdAt: Date
}
