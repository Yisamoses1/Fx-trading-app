import { Wallet } from 'src/wallet/entities/wallet.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { TransactionStatus } from '../dto/status.enum'

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  balanceBefore: number

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  balanceAfter: number

  @Column({ type: 'varchar', length: 10 })
  currency: string

  @Column({ type: 'varchar', length: 20 })
  type: 'FUND' | 'CONVERT' | 'TRADE'

  @Column({ type: 'decimal', precision: 12, scale: 6, nullable: true })
  rateUsed: number

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus

  @Column({ type: 'varchar', length: 50 })
  reference: string

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
    onDelete: 'CASCADE',
  })
  wallet: Wallet

  @CreateDateColumn()
  createdAt: Date
}

// double entry ledger
