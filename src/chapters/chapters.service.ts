import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { Repository } from 'typeorm';
import { BooksService } from 'src/books/books.service';
import { User } from 'src/users/entities/User.entity';
import { Book } from 'src/books/entities/Book.entity';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter) private chaptersRepository: Repository<Chapter>,
    private booksService: BooksService,
  ) {}

  //functions

  //services
  async create(
    user: User,
    bookId: number,
    createChapterDto: CreateChapterDto,
  ): Promise<Chapter> {
    const book = await this.booksService.findOne(user, bookId);
    const chaper = this.chaptersRepository.create({
      ...createChapterDto,
      book,
    });

    return this.chaptersRepository.save(chaper);
  }

  async findAll(user: User, bookId: number): Promise<Chapter[]> {
    const { userId } = user;
    const chapters = this.chaptersRepository.find({
      where: {
        book: {
          bookId,
          user: { userId },
        },
      },
      relations: {
        book: true,
      },
    });
    return chapters;
  }

  async findOne(bookId: number, chapterId: number): Promise<Chapter> {
    const chapter = this.chaptersRepository.findOne({
      where: {
        chapterId,
        book: {
          bookId,
        },
      },
    });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return chapter;
  }

  async update(
    bookId: number,
    chapterId: number,
    updateChapterDto: UpdateChapterDto,
  ): Promise<Chapter> {
    const chapter = await this.findOne(bookId, chapterId);
    const updatedChapter = this.chaptersRepository.create({
      ...chapter,
      ...updateChapterDto,
    });
    return this.chaptersRepository.save(updatedChapter);
  }

  async remove(bookId: number, chapterId: number): Promise<Chapter> {
    const chapter = await this.findOne(bookId, chapterId);
    await this.chaptersRepository.delete(chapterId);
    return chapter;
  }
}
