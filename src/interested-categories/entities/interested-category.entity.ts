import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('interested_categories')
export class InterestedCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'category_ids', type: 'int', array: true })
  categoryIds: number[];

  //relationships
  @ManyToOne(() => User, (user) => user.interestedCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: User;

  @OneToMany(() => Category, (category) => category.interestedCategories)
  @JoinColumn({ name: 'category_ids', referencedColumnName: 'categoryIds' })
  categories: Category[];
}
