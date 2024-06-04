import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
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

  @Column({ name: 'category_id' })
  categoryId: number;

  //relationships
  @ManyToOne(() => User, (user) => user.interestedCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.interestedCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'categoryId' })
  category: Category;
}
