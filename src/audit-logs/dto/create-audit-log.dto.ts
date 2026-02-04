import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator'
import { AuditAction } from '../dto/audit-logs.enum'

export class CreateAuditLogDto {
  @IsUUID()
  userId: string

  // Polymorphic target model name (e.g. "Wallet", "Transaction", "Order")
  @IsString()
  targetModel: string

  // Polymorphic target model id
  @IsUUID()
  targetId: string

  @IsEnum(AuditAction)
  action: AuditAction

  @IsOptional()
  details?: Record<string, any>
}
