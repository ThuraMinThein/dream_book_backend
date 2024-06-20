import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Status } from '../../common/utils/enums/status.enum';
import { Book } from '../../books/entities/book.entity';
import { Progress } from '../../chapter-progress/entities/chapter-progress.entity';

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
