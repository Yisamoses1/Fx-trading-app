import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common'
import { WalletService } from './wallet.service'
import { FundWalletDto } from './dto/fund-wallet.dto'
import { TradeDto } from './dto/trade-wallet.dto'
import { ConvertDto } from './dto/convert-wallet.dto'
import { AuthGuard } from 'src/guard/auth-guard'

@UseGuards(AuthGuard)
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get() async getWallets(@Req() req) {
    const userId = req.user.userId
    return this.walletService.getWallets(userId)
  }

  @Get(':id') async getWalletById(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId
    return this.walletService.getWalletById(userId, id)
  }

  @Post('fund')
  async fundWallet(@Req() req, @Body() payload: FundWalletDto) {
    const userId = req.user.userId
    return this.walletService.fundWallet(userId, payload)
  }

  @Post('convert')
  async convertCurrency(@Req() req, @Body() payload: ConvertDto) {
    const userId = req.user.userId
    const { from, to, amount } = payload

    return this.walletService.convertCurrency(userId, from, to, amount)
  }

  @Post('trade')
  async tradeCurrency(@Req() req, @Body() payload: TradeDto) {
    const userId = req.user.userId
    return this.walletService.tradeCurrency(userId, payload)
  }
}
