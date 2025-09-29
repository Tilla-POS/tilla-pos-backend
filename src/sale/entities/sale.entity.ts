import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { LineItem } from './line-item.entity';
import { Customer } from './customer.entity';
import { Business } from '../../businesses/entities/business.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentMethod } from '../enums/payment-method.enum';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'receipt_id' })
  receiptId: string;

  @OneToMany(() => LineItem, (lineItem) => lineItem.sale, { cascade: true })
  lineItems: LineItem[];

  @Column({ type: 'float', nullable: true, default: 0 })
  discount: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  tax: number;

  @Column({ type: 'float', nullable: false, name: 'sub_total' })
  subTotal: number;

  @Column({ type: 'float', nullable: false, name: 'grand_total' })
  grandTotal: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'receipt_note',
  })
  receiptNote: string;

  @Column({ type: 'float', nullable: true, name: 'cash_receive' })
  cashReceive: number;

  @Column({ type: 'float', nullable: true })
  change: number;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Business, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business: Business;

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
