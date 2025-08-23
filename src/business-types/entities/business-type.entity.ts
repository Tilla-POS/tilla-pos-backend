import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';

@Entity('business_types')
export class BusinessType {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
    unique: true,
  })
  name: string;
  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
    unique: true,
  })
  slug: string;
  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
  })
  description?: string;
  @OneToMany(() => Business, (business) => business.businessType)
  businesses: Business[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date | null;
}
