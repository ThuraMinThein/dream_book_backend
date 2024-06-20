import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from '../common/utils/enums/status.enum';
import { Chapter } from './entities/chapter.entity';
import { User } from '../users/entities/user.entity';
import { BooksService } from '../books/books.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { events } from '../common/utils/constants/event.constant';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter) private chaptersRepository: Repository<Chapter>,
    private booksService: BooksService,
    private eventEmitter: EventEmitter2,
  ) {}

  //services
  async create(
    user: User,
    createChapterDto: CreateChapterDto,
  ): Promise<Chapter> {
    const { slug } = createChapterDto;
    //check if book exists
    const book = await this.booksService.findOneWithSlugByAuthor(user, slug);
    const chaper = this.chaptersRepository.create({
      ...createChapterDto,
      book,
    });

    return this.chaptersRepository.save(chaper);
  }

  //find chaters which are published
  async findAll(slug: string): Promise<Chapter[]> {
    //check if the book from param exists;
    await this.booksService.findOneWithSlug(slug);

    const chapters = await this.chaptersRepository.find({
      where: {
        book: {
          slug,
        },
        status: Status.PUBLISHED,
      },
      relations: {
        book: true,
      },
    });
    if (chapters.length === 0) throw new NotFoundException('No chapter found');
    return chapters;
  }

  async findOne(chapterId: number): Promise<Chapter> {
    const chapter = await this.chaptersRepository.findOne({
      where: {
        chapterId,
        status: Status.PUBLISHED,
      },
      relations: {
        book: true,
      },
    });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return chapter;
  }

  //find chpaters by author
  async findAllByAuthor(user: User, slug: string): Promise<Chapter[]> {
    const chapters = await this.chaptersRepository.find({
      where: {
        book: {
          slug,
          user: {
            userId: user.userId,
          },
        },
      },
      relations: {
        book: true,
      },
    });
    if (chapters.length === 0) throw new NotFoundException('No chapter found');
    return chapters;
  }

  async findOneByAuthor(user: User, chapterId: number): Promise<Chapter> {
    const chapter = await this.chaptersRepository.findOne({
      where: {
        chapterId,
        book: {
          user: {
            userId: user.userId,
          },
        },
      },
      relations: {
        book: true,
      },
    });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return chapter;
  }

  async update(
    user: User,
    chapterId: number,
    updateChapterDto: UpdateChapterDto,
  ): Promise<Chapter> {
    const chapter = await this.findOneByAuthor(user, chapterId);

    //update chapter
    const updatedChapter = this.chaptersRepository.create({
      ...chapter,
      ...updateChapterDto,
    });
    await this.chaptersRepository.save(updatedChapter);

    //check if there is no published chapter and the book is published, then unpublish the book
    const bookId = chapter.book.bookId;

    const publishedChapters = await this.getpublishedChaptersByAuthor(
      user.userId,
      bookId,
    );

    if (publishedChapters.length === 0) {
      this.eventEmitter.emit(events.BOOK_STATUS_CHANGED, { bookId });
    }
    return updatedChapter;
  }

  async remove(user: User, chapterId: number): Promise<Chapter> {
    const chapter = await this.findOneByAuthor(user, chapterId);
    await this.chaptersRepository.delete(chapterId);
    return chapter;
  }

  //functions

  async getpublishedChaptersByAuthor(
    userId: number,
    bookId: number,
  ): Promise<Chapter[]> {
    const publishedChapters = await this.chaptersRepository.find({
      where: {
        book: {
          user: {
            userId,
          },
          bookId,
        },
        status: Status.PUBLISHED,
      },
    });
    return publishedChapters;
  }
}
