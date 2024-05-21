import { Book } from 'src/books/entities/Book.entity';
import { InterestedCategory } from 'src/interested-categories/entities/interested-category.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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
    {
      onDelete: 'CASCADE',
    },
  )
  interestedCategories: InterestedCategory[];

  //many books can have a category
  @OneToMany(() => Book, (book) => book.category, {
    onDelete: 'SET NULL',
  })
  books: Book[];
}
