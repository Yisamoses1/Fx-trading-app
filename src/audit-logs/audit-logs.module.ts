import { Module } from '@nestjs/common'
import { AuditLogService } from './audit-logs.service'
import { AuditLogController } from './audit-logs.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuditLogProcessor } from './audit-logs.processor'
import { BullModule } from '@nestjs/bull'
import { AuditLog } from './entities/audit-log.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    BullModule.registerQueue({ name: 'audit' }),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogProcessor],
  exports: [AuditLogService],
})
export class AuditLogModule {}
