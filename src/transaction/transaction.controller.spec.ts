import { Test, TestingModule } from '@nestjs/testing'
import { TransactionController } from './transaction.controller'
import { TransactionService } from './transaction.service'
import { AuthGuard } from 'src/guard/auth-guard'

describe('TransactionController', () => {
  let controller: TransactionController
  let service: jest.Mocked<TransactionService>

  // Mocking the request object as populated by the AuthGuard
  const mockRequest = {
    user: {
      userId: 'user-123',
      wallet_id: 'wallet-456', // The specific field your controller uses
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            getTransactions: jest.fn(),
            getTransactionById: jest.fn(),
          },
        },
      ],
    })
      // Override guard to bypass actual JWT validation logic
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TransactionController>(TransactionController)
    service = module.get(TransactionService)
  })

  describe('getTransactions', () => {
    it('should call service.getTransactions with wallet_id from request', async () => {
      const mockTxList = [{ id: 'tx-1', amount: 100 }]
      service.getTransactions.mockResolvedValue(mockTxList as any)

      const result = await controller.getTransactions(mockRequest)

      expect(service.getTransactions).toHaveBeenCalledWith('wallet-456')
      expect(result).toEqual(mockTxList)
    })
  })

  describe('getTransactionById', () => {
    it('should call service.getTransactionById with correct ID', async () => {
      const txId = 'tx-unique-id'
      const mockTx = { id: txId, amount: 50 }
      service.getTransactionById.mockResolvedValue(mockTx as any)

      const result = await controller.getTransactionById(txId)

      expect(service.getTransactionById).toHaveBeenCalledWith(txId)
      expect(result).toEqual(mockTx)
    })
  })
})
