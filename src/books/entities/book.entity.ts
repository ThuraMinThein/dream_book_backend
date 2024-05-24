import { Category } from 'src/categories/entities/category.entity';
import { Chapter } from 'src/chapters/entities/chapter.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/User.entity';
import { Status } from 'src/utils/enums/status.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn({ name: 'book_id' })
  bookId: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    name: 'cover_image',
    nullable: true,
    default: null,
    type: 'varchar',
    length: 255,
  })
  coverImage: string;

  @Column({
    nullable: true,
    default: null,
    type: 'text',
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  slug: string;

  @Column({
    type: 'varchar',
    array: true,
  })
  keywords: string[];

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.DRAFT,
  })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  cratedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  //relationships
  //many books can be created by a user
  @ManyToOne(() => User, (user) => user.createdBooks, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: User;

  //a book can have many chapters
  @OneToMany(() => Chapter, (chapter) => chapter.book)
  chapters: Chapter[];

  //many books can have many categories
  @ManyToOne(() => Category, (category) => category.books)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'categoryId' })
  category: Category;

  //one book can have many favorites
  @OneToMany(() => Favorite, (favorite) => favorite.bookId)
  favorites: Favorite[];

  //a book can have many comments
  @OneToMany(() => Comment, (comments) => comments.bookId)
  comments: Comment[];
}
