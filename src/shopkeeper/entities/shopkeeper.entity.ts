import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Business } from '../../business/entities/business.entity';

@Entity()
export class Shopkeeper {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: false, type: 'varchar', length: 96 })
  username: string;
  @Column({ nullable: false, type: 'varchar', length: 96, unique: true })
  email: string;
  @Column({ nullable: false, type: 'varchar', length: 96, unique: true })
  phone: string;
  @Column({ nullable: false, type: 'varchar', length: 96 })
  @Exclude()
  password: string;
  @OneToMany(() => Business, (business) => business.shopkeeper)
  businesses: Business[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
}
