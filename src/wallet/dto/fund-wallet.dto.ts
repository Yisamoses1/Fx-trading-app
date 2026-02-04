import {
  IsNumber,
  IsString,
  IsIn,
  IsNotEmpty,
  IsUUID,
  IsPositive,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class FundWalletDto {
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @IsNotEmpty({ message: 'Amount is required' })
  @Transform(({ value }) => Number(value))
  amount: number

  @IsString({ message: 'Currency must be a string' })
  @IsIn(['NGN', 'USD', 'EUR', 'GBP'])
  @IsNotEmpty({ message: 'Currency is required' })
  currency: string

  @IsString()
  reference?: string

  @IsNotEmpty({ message: 'Amount is required' })
  @IsUUID()
  walletId: string
}
