import { User } from '../../users/entities/user.entity';
import { BusinessType } from '../../business-types/entities/business-type.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;
  @Column({
    type: 'varchar',
    length: 3,
    nullable: false,
  })
  currency: string;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  slug: string;
  @ManyToOne(() => BusinessType)
  @JoinColumn({ name: 'business_type_id' })
  businessType: BusinessType;
  @Column({
    type: 'varchar',
    length: 512,
    nullable: false,
  })
  image: string;
  @OneToOne(() => User)
  @JoinColumn({ name: 'shopkeeper_id' })
  shopkeeper: User;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date | null;
  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;
}
