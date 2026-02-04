import { IsNumber, IsString, IsIn, IsNotEmpty } from 'class-validator'
import { Transform } from 'class-transformer'
import { Currency } from './currency.enum'

export class ConvertDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  amount: number

  @IsString()
  @IsIn(['NGN', 'USD', 'EUR', 'GBP'])
  from: Currency

  @IsString()
  @IsIn(['NGN', 'USD', 'EUR', 'GBP'])
  to: Currency
}
