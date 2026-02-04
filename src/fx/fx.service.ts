import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common'
import axios from 'axios'
import Redis from 'ioredis'

@Injectable()
export class FxRateService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private ttl = 10 * 60

  async getRate(from: string, to: string): Promise<number> {
    try {
      const cacheKey = `fx:${from}_${to}`
      const cachedRate = await this.redis.get(cacheKey)

      if (cachedRate) {
        return parseFloat(cachedRate)
      }

      const response = await axios.get(
        `https://open.er-api.com/v6/latest/${from}`,
      )
      const rates = response.data.rates
      const rate = rates[to]

      if (!rate) throw new Error(`Rate not available for ${from} → ${to}`)

      await this.redis.set(cacheKey, rate.toString(), 'EX', this.ttl)

      return rate
    } catch (error) {
      console.error('Error fetching FX rate:', error)
      throw new InternalServerErrorException(
        `Failed to fetch FX rate: ${error.message}`,
      )
    }
  }

  async getFxRates(base: string = 'USD'): Promise<Record<string, number>> {
    try {
      const cacheKey = `fx:${base}`
      const cachedRates = await this.redis.get(cacheKey)

      if (cachedRates) {
        return JSON.parse(cachedRates)
      }

      const response = await axios.get(
        `https://open.er-api.com/v6/latest/${base}`,
      )
      const rates = response.data.rates

      await this.redis.set(cacheKey, JSON.stringify(rates), 'EX', this.ttl)

      return rates
    } catch (error) {
      console.error('Error fetching FX rates:', error)
      throw new InternalServerErrorException(
        `Failed to fetch FX rates: ${error.message}`,
      )
    }
  }
}
