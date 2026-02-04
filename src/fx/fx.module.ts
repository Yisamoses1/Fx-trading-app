import { Module } from '@nestjs/common'
import { FxRateService } from './fx.service'
import { FxController } from './fx.controller'
import { RedisProvider } from 'src/helper/redis.provider'

@Module({
  controllers: [FxController],
  providers: [FxRateService, RedisProvider],
  exports: [FxRateService],
})
export class FxModule {}
