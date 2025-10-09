import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Session } from './session.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.devices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'name', nullable: true })
  name?: string;

  @Column({ name: 'type', nullable: true })
  type?: string;

  @Column({ name: 'brand', nullable: true })
  brand?: string;

  @Column({ name: 'model', nullable: true })
  model?: string;

  @Column({ name: 'device_id', nullable: true })
  deviceId?: string;

  @Column({ name: 'app_version', nullable: true })
  appVersion?: string;

  @Column({ name: 'is_emulator', default: false })
  isEmulator: boolean;

  @Column({ name: 'is_tablet', default: false })
  isTablet: boolean;

  @Column({ name: 'system_name', nullable: true })
  systemName?: string;

  @Column({ name: 'system_version', nullable: true })
  systemVersion?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'trusted', default: false })
  trusted: boolean;

  @OneToMany(() => Session, (s) => s.device)
  sessions?: Session[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
