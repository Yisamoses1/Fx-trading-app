import { Controller, Get, Param, Query } from '@nestjs/common'
import { FxRateService } from './fx.service'
import { Public } from 'src/common'

@Controller('fx')
export class FxController {
  constructor(private readonly fxRateService: FxRateService) {}
  @Get('rate/:from/:to')
  @Public()
  async getRate(@Param('from') from: string, @Param('to') to: string) {
    return this.fxRateService.getRate(from, to)
  }

  @Get('rates')
  @Public()
  async getAllRates(@Query('base') base: string = 'USD') {
    return this.fxRateService.getFxRates(base)
  }
}
