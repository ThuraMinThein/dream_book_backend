import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/User.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ManyToOne(() => Category, (category) => category.interestedCategories)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'categoryId' })
  category: Category;
}
