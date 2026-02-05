import { Test, TestingModule } from '@nestjs/testing'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { Currency } from './dto/currency.enum'
import { AuthGuard } from 'src/common/guards/auth-guard'
import { Wallet } from './entities/wallet.entity'
import { ConvertDto } from './dto/convert-wallet.dto'

describe('WalletController', () => {
  let controller: WalletController
  let service: jest.Mocked<WalletService>

  const mockRequest = {
    user: { userId: 'user-12' },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            getWallets: jest.fn(),
            getWalletById: jest.fn(),
            fundWallet: jest.fn(),
            convertCurrency: jest.fn(),
            tradeCurrency: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<WalletController>(WalletController)
    service = module.get(WalletService)
  })

  describe('getWallets', () => {
    it('should return all wallets for the user', async () => {
      const expected: Wallet[] = [
        { id: 'wallet1', balance: 0, currency: Currency.USD } as Wallet,
      ]
      service.getWallets.mockResolvedValue(expected)

      const result = await controller.getWallets(mockRequest)

      expect(service.getWallets).toHaveBeenCalledWith('user-12')
      expect(result).toEqual(expected)
    })
  })

  describe('getWalletById', () => {
    it('should return a wallet by id', async () => {
      const expected: Wallet = {
        id: 'wallet1',
        balance: 0,
        currency: Currency.USD,
      } as Wallet
      service.getWalletById.mockResolvedValue(expected)

      const result = await controller.getWalletById(mockRequest, 'wallet1')

      expect(service.getWalletById).toHaveBeenCalledWith('user-12', 'wallet1')
      expect(result).toEqual(expected)
    })
  })

  describe('fundWallet', () => {
    it('should call service.fundWallet with correct params', async () => {
      const payload = { walletId: 'w1', amount: 100, currency: Currency.USD }
      const expected = {
        message: 'Funded',
        balance: 100,
        currency: Currency.USD,
        reference: 'FUND_12345',
      }
      service.fundWallet.mockResolvedValue(expected)

      const result = await controller.fundWallet(mockRequest, payload)

      expect(service.fundWallet).toHaveBeenCalledWith('user-12', payload)
      expect(result).toEqual(expected)
    })
  })

  describe('convertCurrency', () => {
    it('should call service.convertCurrency when params are valid', async () => {
      const payload = { from: Currency.USD, to: Currency.EUR, amount: 50 }
      const expected = {
        message: 'Converted',
        rateUsed: 1.2,
        reference: 'ref123',
        balances: { USD: 50, EUR: 60 },
      }
      service.convertCurrency.mockResolvedValue(expected)

      const result = await controller.convertCurrency(mockRequest, payload)

      expect(service.convertCurrency).toHaveBeenCalledWith(
        'user-12',
        Currency.USD,
        Currency.EUR,
        50,
      )
      expect(result).toEqual(expected)
    })

    it('should throw BadRequestException if params are missing', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      })
      const wrongBody = { from: Currency.USD }
      await expect(
        pipe.transform(wrongBody, { type: 'body', metatype: ConvertDto }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('tradeCurrency', () => {
    it('should call service.tradeCurrency with payload', async () => {
      const payload = { from: Currency.USD, to: Currency.GBP, amount: 20 }
      const expected = {
        message: 'Traded',
        rateUsed: 1.3,
        reference: 'ref456',
        balances: { USD: 80, GBP: 15 },
      }
      service.tradeCurrency.mockResolvedValue(expected)

      const result = await controller.tradeCurrency(mockRequest, payload)

      expect(service.tradeCurrency).toHaveBeenCalledWith('user-12', payload)
      expect(result).toEqual(expected)
    })
  })
})
