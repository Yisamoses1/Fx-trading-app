import { Controller, Post, Body } from '@nestjs/common'
import { EmailService } from './email.service'
import { template } from 'handlebars'

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('templateName') templateName: string,
    @Body('context') context: any,
  ) {
    await this.emailService.sendTemplateEmail(
      to,
      subject,
      templateName,
      context,
    )
    return { message: 'Email sent successfully' }
  }
}
