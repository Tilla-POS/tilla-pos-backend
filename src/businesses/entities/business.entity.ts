import { User } from '../../users/entities/user.entity';
import { BusinessType } from '../../business-types/entities/business-type.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  @ManyToOne(() => BusinessType)
  businessType: BusinessType;
  @Column({
    type: 'varchar',
    length: 512,
    nullable: false,
  })
  image: string;
  @OneToOne(() => User)
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
