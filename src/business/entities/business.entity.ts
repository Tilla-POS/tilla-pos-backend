import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Shopkeeper } from '../../shopkeeper/entities/shopkeeper.entity';

@Entity()
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 96, nullable: false })
  name: string;
  @Column({ type: 'varchar', length: 96, nullable: false, unique: true })
  phone: string;
  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;
  @ManyToOne(() => Shopkeeper, (shopkeeper) => shopkeeper.businesses)
  shopkeeper: Shopkeeper;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
}
