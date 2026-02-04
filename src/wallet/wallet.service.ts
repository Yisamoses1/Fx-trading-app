import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Wallet } from './entities/wallet.entity'
import { User } from 'src/user/entities/user.entity'
import { FundWalletDto } from './dto/fund-wallet.dto'
import { TransactionService } from 'src/transaction/transaction.service'
import { FxRateService } from 'src/fx/fx.service'
import { TradeDto } from './dto/trade-wallet.dto'
import { Currency } from './dto/currency.enum'
import { TransactionStatus } from 'src/transaction/dto/status.enum'
import { AuditLogService } from 'src/audit-logs/audit-logs.service'
import { AuditAction } from 'src/audit-logs/dto/audit-logs.enum'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly transactionService: TransactionService,
    private readonly fxRateService: FxRateService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createWalletForUser(user: User) {
    const existings = await this.walletRepository.find({ where: { user } })
    if (existings.length > 0) return existings

    const wallets = Object.values(Currency).map((currency) =>
      this.walletRepository.create({
        user,
        currency,
        balance: 0,
      }),
    )
    return this.walletRepository.save(wallets)
  }

  async getWallets(userId: string) {
    const wallets = await this.walletRepository.find({
      where: { user: { id: userId } },
    })
    if (!wallets || wallets.length === 0) {
      throw new BadRequestException('No wallets found for this user')
    }
    return wallets
  }

  async getWalletById(userId: string, walletId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId, user: { id: userId } },
    })
    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }
    return wallet
  }

  async fundWallet(userId: string, payload: FundWalletDto) {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId }, id: payload.walletId },
    })

    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }

    if (wallet.currency !== payload.currency) {
      throw new BadRequestException(
        `Wallet currency ${wallet.currency} does not match requested currency ${payload.currency}`,
      )
    }

    const balanceBefore = parseFloat(wallet.balance.toString()) || 0
    const amount = payload.amount
    if (amount <= 0) {
      throw new BadRequestException('Amount must be a positive number')
    }
    const reference = payload.reference || `FUND_${Date.now()}`

    const pendingTx = await this.transactionService.createTransaction(
      wallet.id,
      {
        amount,
        currency: payload.currency,
        type: 'FUND',
        reference,
        balanceBefore,
        status: TransactionStatus.PENDING,
      },
    )
    wallet.balance = balanceBefore + amount
    await this.walletRepository.save(wallet)

    await this.transactionService.updateTransaction(pendingTx.id, {
      balanceAfter: wallet.balance,
      status: TransactionStatus.SUCCESS,
    })

    await this.auditLogService.record({
      userId,
      targetModel: 'Wallet',
      targetId: wallet.id,
      action: AuditAction.FUND,
      details: {
        amount,
        currency: payload.currency,
        balanceBefore,
        balanceAfter: wallet.balance,
        reference,
      },
    })

    return {
      message: 'Wallet funded successfully',
      balance: wallet.balance,
      currency: wallet.currency,
      reference,
    }
  }

  async convertCurrency(
    userId: string,
    from: Currency,
    to: Currency,
    amount: number,
  ) {
    if (
      !Object.values(Currency).includes(from) ||
      !Object.values(Currency).includes(to)
    ) {
      throw new BadRequestException(
        `Unsupported currency conversion: ${from} → ${to}`,
      )
    }
    if (from === to) {
      throw new BadRequestException('Cannot convert to the same currency')
    }

    const fromWallet = await this.walletRepository.findOne({
      where: { user: { id: userId }, currency: from },
    })

    if (!fromWallet)
      throw new BadRequestException(`Wallet for ${from} not found`)

    const fromBalance = parseFloat(fromWallet.balance.toString()) || 0

    if (fromBalance < amount) {
      throw new BadRequestException(`Insufficient ${from} balance`)
    }

    const toWallet = await this.walletRepository.findOne({
      where: { user: { id: userId }, currency: to },
    })
    if (!toWallet) throw new BadRequestException(`Wallet for ${to} not found`)

    const toBalance = parseFloat(toWallet.balance.toString()) || 0

    const rate = await this.fxRateService.getRate(from, to)
    const convertedAmount = amount * rate
    const reference = `CONVERT_${from}_${to}_${Date.now()}`

    let debitTx = await this.transactionService.createTransaction(
      fromWallet.id,
      {
        amount,
        currency: from,
        type: 'CONVERT',
        rateUsed: rate,
        reference,
        balanceBefore: fromBalance,
        balanceAfter: fromBalance,
        status: TransactionStatus.PENDING,
      },
    )

    fromWallet.balance = fromBalance - amount
    await this.walletRepository.save(fromWallet)

    debitTx.balanceAfter = fromWallet.balance
    debitTx.status = TransactionStatus.SUCCESS
    await this.transactionService.updateTransaction(debitTx.id, debitTx)

    let creditTx = await this.transactionService.createTransaction(
      toWallet.id,
      {
        amount: convertedAmount,
        currency: to,
        type: 'CONVERT',
        rateUsed: rate,
        reference,
        balanceBefore: toBalance,
        balanceAfter: toBalance,
        status: TransactionStatus.PENDING,
      },
    )

    toWallet.balance = toBalance + convertedAmount
    await this.walletRepository.save(toWallet)

    creditTx.balanceAfter = toWallet.balance
    creditTx.status = TransactionStatus.SUCCESS
    await this.transactionService.updateTransaction(creditTx.id, creditTx)

    await this.auditLogService.record({
      userId,
      targetModel: 'Wallet',
      targetId: fromWallet.id,
      action: AuditAction.CONVERT,
      details: {
        from,
        to,
        amount,
        convertedAmount,
        rate,
        reference,
        debitTransactionId: debitTx.id,
        creditTransactionId: creditTx.id,
        balances: { [from]: fromWallet.balance, [to]: toWallet.balance },
      },
    })

    return {
      message: `Converted ${amount} ${from} → ${convertedAmount.toFixed(2)} ${to}`,
      rateUsed: rate,
      reference,
      balances: {
        [from]: fromWallet.balance,
        [to]: toWallet.balance,
      },
    }
  }

  async tradeCurrency(userId: string, payload: TradeDto) {
    const { amount, from, to } = payload

    if (
      !Object.values(Currency).includes(from) ||
      !Object.values(Currency).includes(to)
    ) {
      throw new BadRequestException(
        `Unsupported currency trade: ${from} → ${to}`,
      )
    }
    if (from === to) {
      throw new BadRequestException('Cannot trade to the same currency')
    }

    const fromWallet = await this.walletRepository.findOne({
      where: { user: { id: userId }, currency: from },
    })
    if (!fromWallet)
      throw new BadRequestException(`Wallet for ${from} not found`)

    const fromBalance = parseFloat(fromWallet.balance.toString()) || 0

    if (fromBalance < amount) {
      throw new BadRequestException(`Insufficient ${from} balance`)
    }

    const toWallet = await this.walletRepository.findOne({
      where: { user: { id: userId }, currency: to },
    })
    if (!toWallet) throw new BadRequestException(`Wallet for ${to} not found`)

    const toBalance = parseFloat(toWallet.balance.toString()) || 0

    const rate = await this.fxRateService.getRate(from, to)
    const tradedAmount = amount * rate
    const reference = `TRADE_${from}_${to}_${Date.now()}`

    let debitTx = await this.transactionService.createTransaction(
      fromWallet.id,
      {
        amount,
        currency: from,
        type: 'TRADE',
        rateUsed: rate,
        reference,
        balanceBefore: fromBalance,
        balanceAfter: fromBalance,
        status: TransactionStatus.PENDING,
      },
    )

    fromWallet.balance = fromBalance - amount
    await this.walletRepository.save(fromWallet)

    debitTx.balanceAfter = fromWallet.balance
    debitTx.status = TransactionStatus.SUCCESS
    await this.transactionService.updateTransaction(debitTx.id, debitTx)

    let creditTx = await this.transactionService.createTransaction(
      toWallet.id,
      {
        amount: tradedAmount,
        currency: to,
        type: 'TRADE',
        rateUsed: rate,
        reference,
        balanceBefore: toBalance,
        balanceAfter: toBalance,
        status: TransactionStatus.PENDING,
      },
    )

    toWallet.balance = toBalance + tradedAmount
    await this.walletRepository.save(toWallet)

    creditTx.balanceAfter = toWallet.balance
    creditTx.status = TransactionStatus.SUCCESS
    await this.transactionService.updateTransaction(creditTx.id, creditTx)

    await this.auditLogService.record({
      userId,
      targetModel: 'Wallet',
      targetId: fromWallet.id,
      action: AuditAction.TRADE,
      details: {
        from,
        to,
        amount,
        tradedAmount,
        rate,
        reference,
        transactionId: debitTx.id,
        balances: { [from]: fromWallet.balance },
      },
    })

    await this.auditLogService.record({
      userId,
      targetModel: 'Wallet',
      targetId: toWallet.id,
      action: AuditAction.TRADE,
      details: {
        from,
        to,
        amount,
        tradedAmount,
        rate,
        reference,
        transactionId: creditTx.id,
        balances: { [to]: toWallet.balance },
      },
    })

    return {
      message: `Traded ${amount} ${from} → ${tradedAmount.toFixed(2)} ${to}`,
      rateUsed: rate,
      reference,
      balances: {
        [from]: fromWallet.balance,
        [to]: toWallet.balance,
      },
    }
  }
}
