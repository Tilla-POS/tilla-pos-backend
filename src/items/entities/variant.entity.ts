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
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Sku } from './sku.entity';
import { User } from '../../users/entities/user.entity';
import { Item } from './item.entity';
import { Modifier } from '../../modifier/entities/modifier.entity';
@Entity('variants')
export class Variant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 512, nullable: false })
  image: string;

  @Column({ type: 'float', nullable: false, name: 'selling_price' })
  sellingPrice: number;

  @Column({ type: 'float', nullable: true, name: 'purchase_price' })
  purchasePrice: number;

  @Column({ type: 'float', nullable: true })
  margin: number;

  @OneToOne(() => Sku, { cascade: true })
  @JoinColumn({ name: 'sku_id' })
  stock: Sku;

  @Column({ type: 'varchar', length: 255, nullable: true })
  barcode: string;

  @Column({ type: 'date', nullable: true, name: 'manufacture_date' })
  manufactureDate: Date;

  @Column({ type: 'date', nullable: true, name: 'expire_date' })
  expireDate: Date;

  @Column({ type: 'date', nullable: true, name: 'expire_date_alert' })
  expireDateAlert: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tax: string;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: true,
    name: 'internal_note',
  })
  internalNote: string;

  @ManyToMany(() => Modifier, (modifier: Modifier) => modifier.variants)
  @JoinTable()
  modifiers: Modifier[];

  @ManyToOne(() => Item, (item: Item) => item.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy: User;
}
