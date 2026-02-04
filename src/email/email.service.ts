import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bullmq'
import * as fs from 'fs'
import * as path from 'path'
import * as Handlebars from 'handlebars'

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async sendTemplateEmail(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, any>,
  ) {
    try {
      const templatePath = path.join(
        process.cwd(),
        'dist',
        'email',
        'templates',
        `${templateName}.hbs`,
      )
      const source = fs.readFileSync(templatePath, 'utf8')
      const compiledTemplate = Handlebars.compile(source)
      const html = compiledTemplate(context)

      await this.emailQueue.add(
        'send',
        { to, subject, html },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      )

      return { message: 'Email job queued successfully' }
    } catch (error) {
      throw new InternalServerErrorException(error, error.message)
    }
  }
}
