import { Book } from 'src/books/entities/Book.entity';
import { Progress } from 'src/chapter-progress/entities/chapter-progress.entity';
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

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn({ name: 'chapter_id' })
  chapterId: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  content: string;

  @Column({
    default: 0,
  })
  priority: number;

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
