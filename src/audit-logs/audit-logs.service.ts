import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuditLog } from './entities/audit-log.entity'
import { CreateAuditLogDto } from './dto/create-audit-log.dto'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bullmq'

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectQueue('audit')
    private readonly auditQueue: Queue,
  ) {}

  async record(dto: CreateAuditLogDto) {
    try {
      console.log('Adding audit log to queue:', dto)
      await this.auditQueue.add('record', dto, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      })
      console.log('Audit log job queued successfully')
      return { message: 'Audit log job queued successfully' }
    } catch (error) {
      console.error('Error queuing audit log:', error)
      throw new InternalServerErrorException(error, error.message)
    }
  }

  async findAllByUser(
    userId: string,
  ): Promise<{ message: string; audits: AuditLog[] }> {
    const audits = await this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })

    if (!audits || audits.length === 0) {
      throw new NotFoundException(`No audit logs found for user ${userId}`)
    }

    return {
      message: 'Audit logs fetched successfully',
      audits,
    }
  }

  async findAllByTarget(
    targetModel: string,
    targetId: string,
  ): Promise<{ message: string; audits: AuditLog[] }> {
    const audits = await this.auditLogRepository.find({
      where: { targetModel, targetId },
      order: { createdAt: 'DESC' },
    })

    if (!audits || audits.length === 0) {
      throw new NotFoundException(
        `No audit logs found for ${targetModel} with id ${targetId}`,
      )
    }

    return {
      message: 'Audit logs fetched successfully',
      audits,
    }
  }

  async findOne(id: string): Promise<{ message: string; audit: AuditLog }> {
    const audit = await this.auditLogRepository.findOne({ where: { id } })

    if (!audit) {
      throw new NotFoundException(`Audit log with id ${id} not found`)
    }

    return {
      message: 'Audit log fetched successfully',
      audit,
    }
  }
}
