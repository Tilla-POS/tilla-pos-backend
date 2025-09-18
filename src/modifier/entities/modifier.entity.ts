import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
} from 'typeorm';
import { ModifierSet } from './modifier-set.entity';
import { Variant } from '../../items/entities/variant.entity';

@Entity('modifier')
export class Modifier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(() => ModifierSet, (set) => set.modifier, { cascade: true })
  options: ModifierSet[];

  @ManyToMany(() => Variant, (variant: Variant) => variant.modifiers, {
    onDelete: 'CASCADE',
  })
  variants: Variant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
