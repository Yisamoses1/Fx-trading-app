import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bullmq'
import { createTransport } from 'nodemailer'

@Processor('email')
export class EmailProcessor {
  private transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    port: 587,
    secure: false,
    requireTLS: true,
  })

  @Process('send')
  async handleSend(job: Job) {
    const { to, subject, text, html } = job.data

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    }

    try {
      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully', result)
    } catch (error) {
      console.error('Error sending email', error)
      throw error
    }
  }
}
