import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  const reflector = app.get(Reflector)
  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
  )

  app.enableCors()

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT')
  if (!port) {
    throw new Error('PORT environment variable is not defined')
  }

  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
}
bootstrap()
