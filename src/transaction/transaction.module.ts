import { forwardRef, Module } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { TransactionController } from './transaction.controller'
import { Transaction } from './entities/transaction.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletModule } from 'src/wallet/wallet.module'
import { Wallet } from 'src/wallet/entities/wallet.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Wallet]),
    forwardRef(() => WalletModule),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
