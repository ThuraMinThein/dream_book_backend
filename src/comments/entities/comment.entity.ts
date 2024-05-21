import { Book } from 'src/books/entities/Book.entity';
import { User } from 'src/users/entities/User.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  comment_id: number;

  @Column({
    type: 'text',
  })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  cratedAt: Date;

  //relationships
  //many comments can be created by one user
  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  userId: User;

  //a book can have many comments
  @ManyToOne(() => Book, (book) => book.comments)
  @JoinColumn({ name: 'book_id', referencedColumnName: 'bookId' })
  bookId: Book;
}
