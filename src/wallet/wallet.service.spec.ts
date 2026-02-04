import { Test, TestingModule } from '@nestjs/testing'
import { WalletService } from './wallet.service'
import { Repository } from 'typeorm'
import { Wallet } from './entities/wallet.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { TransactionService } from 'src/transaction/transaction.service'
import { FxRateService } from 'src/fx/fx.service'
import { AuditLogService } from 'src/audit-logs/audit-logs.service'
import { Currency } from './dto/currency.enum'
import { TransactionStatus } from 'src/transaction/dto/status.enum'
import { AuditAction } from 'src/audit-logs/dto/audit-logs.enum'
import { Transaction } from 'src/transaction/entities/transaction.entity'
import { User } from 'src/user/entities/user.entity'

describe('WalletService', () => {
  let service: WalletService
  let walletRepo: jest.Mocked<Repository<Wallet>>
  let transactionService: jest.Mocked<TransactionService>
  let fxRateService: jest.Mocked<FxRateService>
  let auditLogService: jest.Mocked<AuditLogService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn(),
            updateTransaction: jest.fn(),
          },
        },
        {
          provide: FxRateService,
          useValue: {
            getRate: jest.fn(),
          },
        },
        {
          provide: AuditLogService,
          useValue: {
            record: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<WalletService>(WalletService)
    walletRepo = module.get(getRepositoryToken(Wallet))
    transactionService = module.get(TransactionService)
    fxRateService = module.get(FxRateService)
    auditLogService = module.get(AuditLogService)

    walletRepo.save.mockImplementation(async (data) => data as Wallet)
  })

  describe('createWalletForUser', () => {
    it('should create wallets for all supported currencies if none exist', async () => {
      const user: User = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'hashed-password',
        verified: true,
        wallets: [],
        tokens: [],
        otps: [],
        passwords: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      walletRepo.find.mockResolvedValue([])
      walletRepo.create.mockImplementation(
        (data: Partial<Wallet>) => data as Wallet,
      )
      const result = await service.createWalletForUser(user)

      const currencyCount = Object.values(Currency).length
      expect(walletRepo.create).toHaveBeenCalledTimes(currencyCount)
      expect(result).toHaveLength(currencyCount)
    })
  })

  describe('fundWallet', () => {
    it('should fund wallet, update transaction, and record audit log', async () => {
      const wallet: Wallet = {
        id: 'w1',
        balance: 100,
        currency: Currency.USD,
      } as Wallet
      walletRepo.findOne.mockResolvedValue(wallet)

      transactionService.createTransaction.mockResolvedValue({
        id: 'tx1',
        amount: 50,
        currency: Currency.USD,
        type: 'FUND',
        reference: 'REF123',
        balanceBefore: 100,
        balanceAfter: 150,
        status: TransactionStatus.PENDING,
      } as Partial<Transaction> as Transaction)

      const result = await service.fundWallet('1', {
        walletId: 'w1',
        amount: 50,
        currency: Currency.USD,
        reference: 'REF123',
      })

      expect(result.balance).toBe(150)
      expect(transactionService.updateTransaction).toHaveBeenCalledWith(
        'tx1',
        expect.objectContaining({
          status: TransactionStatus.SUCCESS,
        }),
      )
      expect(auditLogService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.FUND,
          userId: '1',
        }),
      )
    })
  })

  describe('convertCurrency', () => {
    it('should perform double-entry conversion and audit the action', async () => {
      const fromWallet: Wallet = {
        id: 'w1',
        balance: 100,
        currency: Currency.USD,
      } as Wallet
      const toWallet: Wallet = {
        id: 'w2',
        balance: 200,
        currency: Currency.EUR,
      } as Wallet

      walletRepo.findOne
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet)

      fxRateService.getRate.mockResolvedValue(0.8)
      transactionService.createTransaction
        .mockResolvedValueOnce({
          id: 'debit-tx',
        } as Partial<Transaction> as Transaction)
        .mockResolvedValueOnce({
          id: 'credit-tx',
        } as Partial<Transaction> as Transaction)

      const result = await service.convertCurrency(
        '1',
        Currency.USD,
        Currency.EUR,
        50,
      )

      expect(result.balances[Currency.USD]).toBe(50)
      expect(result.balances[Currency.EUR]).toBe(240)
      expect(walletRepo.save).toHaveBeenCalledTimes(2)
      expect(auditLogService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.CONVERT,
        }),
      )
    })
  })

  describe('tradeCurrency', () => {
    it('should trade currency and audit the action', async () => {
      const fromWallet: Wallet = {
        id: 'w1',
        balance: 500,
        currency: Currency.USD,
      } as Wallet
      const toWallet: Wallet = {
        id: 'w2',
        balance: 0,
        currency: Currency.GBP,
      } as Wallet

      walletRepo.findOne
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet)

      fxRateService.getRate.mockResolvedValue(0.75)
      transactionService.createTransaction
        .mockResolvedValueOnce({
          id: 't1',
        } as Partial<Transaction> as Transaction)
        .mockResolvedValueOnce({
          id: 't2',
        } as Partial<Transaction> as Transaction)

      const result = await service.tradeCurrency('1', {
        amount: 100,
        from: Currency.USD,
        to: Currency.GBP,
      })

      expect(result.balances[Currency.USD]).toBe(400)
      expect(result.balances[Currency.GBP]).toBe(75)
      expect(auditLogService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.TRADE,
        }),
      )
    })
  })
})
