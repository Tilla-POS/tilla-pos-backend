import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';
import { Session } from '../../session/entities/session.entity';
import { Device } from '../../session/entities/device.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  username: string;
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  phone: string;
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  email: string;
  // OneToMany relation with sessions
  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
  // OneToMany relation with devices
  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    // select: false, // Do not select by default
  })
  @Exclude()
  password: string;
  @OneToOne(() => Business, (business) => business.shopkeeper)
  business: Business;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date | null;
}
