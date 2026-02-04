import { Controller, Get, Param, Query } from '@nestjs/common'
import { FxRateService } from './fx.service'

@Controller('fx')
export class FxController {
  constructor(private readonly fxRateService: FxRateService) {}
  @Get('rate/:from/:to')
  async getRate(@Param('from') from: string, @Param('to') to: string) {
    return this.fxRateService.getRate(from, to)
  }

  @Get('rates')
  async getAllRates(@Query('base') base: string = 'USD') {
    return this.fxRateService.getFxRates(base)
  }
}
