import { Book } from '../../books/entities/book.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InterestedCategory } from '../../interested-categories/entities/interested-category.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    nullable: true,
    default: null,
    type: 'varchar',
    length: 255,
  })
  icon: string;

  @Column({
    default: 0,
  })
  priority: number;

  //relationships
  //a category can have many users interested in it
  @OneToMany(
    () => InterestedCategory,
    (interestedCategory) => interestedCategory.category,
  )
  interestedCategories: InterestedCategory[];

  //many books can have a category
  @OneToMany(() => Book, (book) => book.category)
  books: Book[];
}
