import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  password: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
}
