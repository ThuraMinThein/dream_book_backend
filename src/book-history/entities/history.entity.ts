import { Book } from '../../books/entities/book.entity';
import { User } from '../../users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('books_history')
export class History {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'book_id' })
  bookId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //realtionships
  @ManyToOne(() => User, (user) => user.histories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: User;

  @ManyToOne(() => Book, (book) => book.histories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id', referencedColumnName: 'bookId' })
  book: Book;
}
