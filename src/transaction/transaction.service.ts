import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Transaction } from './entities/transaction.entity'
import { Repository } from 'typeorm'
import { Wallet } from '../wallet/entities/wallet.entity'
import { TransactionStatus } from './dto/status.enum'

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async createTransaction(walletId: string, payload: CreateTransactionDto) {
    const transaction = this.transactionRepository.create({
      amount: payload.amount,
      currency: payload.currency,
      type: payload.type,
      reference: payload.reference,
      status: TransactionStatus.PENDING,
      wallet: { id: walletId } as Wallet,
    })
    return this.transactionRepository.save(transaction)
  }

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    await this.transactionRepository.update(id, updates)
    return this.transactionRepository.findOne({ where: { id } })
  }

  async getTransactions(walletId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { wallet: { id: walletId } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    })

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getTransactionById(id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    })
    if (!transaction) {
      throw new BadRequestException('Transaction not found')
    }
    return transaction
  }
}
