import { Provider } from '@nestjs/common'
import Redis from 'ioredis'

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis({
      host: 'localhost', // or your Redis host
      port: 6379,
    })
  },
}
