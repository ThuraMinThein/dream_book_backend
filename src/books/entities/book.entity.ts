import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Status } from '../../common/utils/enums/status.enum';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Chapter } from '../../chapters/entities/chapter.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Category } from '../../categories/entities/category.entity';
import { History } from '../../book-history/entities/history.entity';
import { Progress } from '../../chapter-progress/entities/chapter-progress.entity';

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
    unique: true,
  })
  slug: string;

  @Column({
    type: 'varchar',
    array: true,
  })
  keywords: string[];

  @Column({
    name: 'favorite_count',
    nullable: true,
    default: 0,
  })
  favoriteCount: number;

  @Column({ name: 'is_favorite', nullable: true, default: false })
  isFavorite: boolean;

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

  @Column({ name: 'deleted_expired_date', nullable: true, default: null })
  deletedExpiredDate: Date;

  @Column({ name: 'expire_day_left', nullable: true, default: null })
  expireDayLeft: number;

  //relationships
  //many books can be created by a user
  @ManyToOne(() => User, (user) => user.books, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: User;

  //a book can have many chapters
  @OneToMany(() => Chapter, (chapter) => chapter.book)
  chapters: Chapter[];

  //many books can have many categories
  @ManyToOne(() => Category, (category) => category.books, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'categoryId' })
  category: Category;

  //one book can have many favorites
  @OneToMany(() => Favorite, (favorite) => favorite.book)
  favorites: Favorite[];

  //a book can have many comments
  @OneToMany(() => Comment, (comments) => comments.book)
  comments: Comment[];

  //a book can have many chapter progresses
  @OneToMany(() => Progress, (progresses) => progresses.book)
  progresses: Progress[];

  //a book can have many book histories
  @OneToMany(() => History, (histories) => histories.book)
  histories: History[];
}
