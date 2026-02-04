import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator'
import { TransactionStatus } from './status.enum'

export class CreateTransactionDto {
  @IsNumber()
  amount: number

  @IsString()
  @IsIn(['NGN', 'USD', 'EUR'])
  currency: string

  @IsString()
  @IsIn(['FUND', 'CONVERT', 'TRADE'])
  type: 'FUND' | 'CONVERT' | 'TRADE'

  @IsOptional()
  @IsNumber()
  rateUsed?: number

  @IsOptional()
  @IsString()
  reference?: string

  @IsOptional()
  @IsString()
  status: TransactionStatus

  @IsOptional()
  @IsNumber()
  balanceBefore?: number
  @IsOptional()
  @IsNumber()
  balanceAfter?: number
}
