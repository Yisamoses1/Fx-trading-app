import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common'
import { AuditLogService } from './audit-logs.service'
import { CreateAuditLogDto } from './dto/create-audit-log.dto'

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  async create(@Body() dto: CreateAuditLogDto) {
    this.auditLogService.record(dto)
    return { message: 'Audit log queued for recording' }
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: string) {
    return this.auditLogService.findAllByUser(userId)
  }

  @Get(':targetModel/:targetId')
  async findAllByTarget(
    @Param('targetModel') targetModel: string,
    @Param('targetId') targetId: string,
  ) {
    return this.auditLogService.findAllByTarget(targetModel, targetId)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.auditLogService.findOne(id)
  }
}
