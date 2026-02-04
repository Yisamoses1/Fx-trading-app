import { Controller, Get, Param, Req, UseGuards, Query } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { AuthGuard } from 'src/guard/auth-guard'

@UseGuards(AuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getTransactions(
    @Req() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 20
    return this.transactionService.getTransactions(
      req.user.wallet_id,
      pageNum,
      limitNum,
    )
  }

  @Get('/:id')
  async getTransactionById(@Param('id') id: string) {
    return this.transactionService.getTransactionById(id)
  }
}
