import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { Status } from '../../common/utils/enums/status.enum';
import { Progress } from '../../chapter-progress/entities/chapter-progress.entity';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn({ name: 'chapter_id' })
  chapterId: number;

  @Column({
    length: 255,
    type: 'varchar',
  })
  title: string;

  @Column({
    type: 'text',
    default: null,
    nullable: true,
  })
  content: string;

  // @Column({
  //   default: 0,
  // })
  // priority: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.DRAFT,
  })
  status: Status;

  @Column({ type: 'number', name: 'book_id' })
  bookId: number;

  @CreateDateColumn({ name: 'created_at' })
  cratedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //relationship
  //many chapters can be owned by a book
  @ManyToOne(() => Book, (book) => book.chapters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id', referencedColumnName: 'bookId' })
  book: Book;

  //a chapter can have many progresses
  @OneToMany(() => Progress, (progresses) => progresses.chapter)
  progresses: Progress[];
}
