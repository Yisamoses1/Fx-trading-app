import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AuditAction } from '../dto/audit-logs.enum'

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', nullable: true })
  userId: string

  @Column()
  targetModel: string

  @Column({ type: 'uuid' })
  targetId: string

  @Column()
  action: AuditAction

  @Column('jsonb')
  details: Record<string, any>

  @CreateDateColumn()
  createdAt: Date
}
