import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/User.entity';
import { Book } from '../../books/entities/Book.entity';
import { Chapter } from '../../chapters/entities/chapter.entity';

@Entity('chapter_progresses')
export class Progress {
  @PrimaryGeneratedColumn({ name: 'progress_id' })
  progressId: number;

  @Column()
  progress: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'book_id' })
  bookId: number;

  @Column({ name: 'chapter_id' })
  chapterId: number;

  //relationships
  //a user can have many chapter progressse
  @ManyToOne(() => User, (user) => user.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: User;

  //a book can have many chapter progresses
  @ManyToOne(() => Book, (book) => book.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id', referencedColumnName: 'bookId' })
  book: Book;

  //a chapter can have many chapter progresses
  @ManyToOne(() => Chapter, (chapter) => chapter.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chapter_id', referencedColumnName: 'chapterId' })
  chapter: Chapter;
}
