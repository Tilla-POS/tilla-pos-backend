import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Device } from './device.entity';
import { Location } from './location.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Device, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'device_id' })
  device?: Device;

  @ManyToOne(() => Location, { nullable: true, cascade: ['insert'] })
  @JoinColumn({ name: 'location_id' })
  location?: Location;

  @Column({ name: 'refresh_token_jti', nullable: true })
  @Index()
  refreshTokenJti?: string;

  @Column({ name: 'access_token_jti', nullable: true })
  accessTokenJti?: string;

  @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
  lastSeenAt?: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ name: 'compromised', default: false })
  compromised: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
