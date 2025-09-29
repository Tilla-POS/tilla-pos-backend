import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Variant } from '../../items/entities/variant.entity';
import { ModifierSet } from '../../modifier/entities/modifier-set.entity';
import { User } from '../../users/entities/user.entity';
import { Sale } from './sale.entity';

@Entity('line_items')
export class LineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Variant, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: Variant;

  @Column({ type: 'float', nullable: false })
  price: number;

  @Column({ type: 'float', nullable: false })
  quantity: number;

  @Column({ type: 'float', nullable: false })
  total: number;

  @ManyToOne(() => ModifierSet, { nullable: true })
  @JoinColumn({ name: 'modifier_set_id' })
  modifierSet: ModifierSet;

  @ManyToOne(() => Sale, (sale) => sale.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy: User;
}
