import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    // select: false, // Do not select by default
  })
  @Exclude()
  password: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date | null;
}
