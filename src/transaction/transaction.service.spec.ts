import { Test, TestingModule } from '@nestjs/testing'
import { TransactionService } from './transaction.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Transaction } from './entities/transaction.entity'
import { Wallet } from '../wallet/entities/wallet.entity'
import { Repository } from 'typeorm'
import { TransactionStatus } from './dto/status.enum'
import { BadRequestException } from '@nestjs/common'

describe('TransactionService', () => {
  let service: TransactionService
  let transactionRepo: jest.Mocked<Repository<Transaction>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<TransactionService>(TransactionService)
    transactionRepo = module.get(getRepositoryToken(Transaction))
  })

  describe('createTransaction', () => {
    it('should create and save a pending transaction', async () => {
      const walletId = 'wallet-123'
      const payload = {
        amount: 100,
        currency: 'USD',
        type: 'FUND',
        reference: 'REF-1',
      } as any

      const mockTransaction = {
        ...payload,
        id: 'tx-1',
        status: TransactionStatus.PENDING,
      }

      transactionRepo.create.mockReturnValue(mockTransaction as any)
      transactionRepo.save.mockResolvedValue(mockTransaction as any)

      const result = await service.createTransaction(walletId, payload)

      expect(transactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          wallet: { id: walletId },
          status: TransactionStatus.PENDING,
        }),
      )
      expect(transactionRepo.save).toHaveBeenCalled()
      expect(result.status).toBe(TransactionStatus.PENDING)
    })
  })

  describe('updateTransaction', () => {
    it('should update the transaction and return the new state', async () => {
      const txId = 'tx-1'
      const updates = { status: TransactionStatus.SUCCESS, balanceAfter: 200 }
      const updatedTx = { id: txId, ...updates }

      transactionRepo.update.mockResolvedValue({} as any)
      transactionRepo.findOne.mockResolvedValue(updatedTx as any)

      const result = await service.updateTransaction(txId, updates)

      expect(transactionRepo.update).toHaveBeenCalledWith(txId, updates)
      expect(transactionRepo.findOne).toHaveBeenCalledWith({
        where: { id: txId },
      })
      expect(result).toEqual(updatedTx)
    })
  })

  describe('getTransactions', () => {
    it('should return transactions for a specific wallet ordered by date', async () => {
      const walletId = 'wallet-1'
      const mockList = [{ id: '1' }, { id: '2' }]
      transactionRepo.find.mockResolvedValue(mockList as any)

      const result = await service.getTransactions(walletId)

      expect(transactionRepo.find).toHaveBeenCalledWith({
        where: { wallet: { id: walletId } },
        order: { createdAt: 'DESC' },
      })
      expect(result).toHaveLength(2)
    })
  })

  describe('getTransactionById', () => {
    it('should return a transaction if it exists', async () => {
      const mockTx = { id: 'tx-1' }
      transactionRepo.findOne.mockResolvedValue(mockTx as any)

      const result = await service.getTransactionById('tx-1')
      expect(result).toEqual(mockTx)
    })

    it('should throw BadRequestException if transaction is not found', async () => {
      transactionRepo.findOne.mockResolvedValue(null)

      await expect(service.getTransactionById('invalid-id')).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
