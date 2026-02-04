import { User } from 'src/user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Transaction } from 'src/transaction/entities/transaction.entity'
import { Currency } from '../dto/currency.enum'

@Entity('wallet')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number

  @Column({ type: 'varchar', length: 10,})
  currency: Currency

  @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
  user: User

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
