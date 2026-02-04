import { forwardRef, Module } from '@nestjs/common'
import { WalletService } from './wallet.service'
import { WalletController } from './wallet.controller'
import { TransactionModule } from 'src/transaction/transaction.module'
import { FxModule } from 'src/fx/fx.module'
import { Wallet } from './entities/wallet.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Transaction } from 'src/transaction/entities/transaction.entity'
import { AuditLogModule } from 'src/audit-logs/audit-logs.module'

@Module({
  imports: [
    FxModule,
    TypeOrmModule.forFeature([Wallet, Transaction]),
    forwardRef(() => TransactionModule),
    AuditLogModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
