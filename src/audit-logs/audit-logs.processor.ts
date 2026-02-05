import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuditLog } from './entities/audit-log.entity'

@Processor('audit')
export class AuditLogProcessor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  @Process('record')
  async handleRecord(job: Job) {
    const { userId, targetModel, targetId, action, details } = job.data

    const auditLog = this.auditLogRepository.create({
      userId,
      targetModel,
      targetId,
      action,
      details,
    })

    try {
      await this.auditLogRepository.save(auditLog)
    } catch (error) {
      console.error('Error saving audit log', error)
      throw error
    }
  }
}
