import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { User } from '../users/entities/User.entity';
import { BooksService } from '../books/books.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter) private chaptersRepository: Repository<Chapter>,
    private booksService: BooksService,
  ) {}

  //services
  async create(
    user: User,
    createChapterDto: CreateChapterDto,
  ): Promise<Chapter> {
    const book = await this.booksService.findOneByUser(
      user,
      createChapterDto.bookId,
    );
    const chaper = this.chaptersRepository.create({
      ...createChapterDto,
      book,
    });

    return this.chaptersRepository.save(chaper);
  }

  async findAll(): Promise<Chapter[]> {
    const chapters = this.chaptersRepository.find({
      relations: {
        book: true,
      },
    });
    return chapters;
  }

  async findOne(chapterId: number): Promise<Chapter> {
    const chapter = await this.chaptersRepository.findOne({
      where: {
        chapterId,
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
    const chapter = await this.findOneByUser(user, chapterId);
    const updatedChapter = this.chaptersRepository.create({
      ...chapter,
      ...updateChapterDto,
    });
    return this.chaptersRepository.save(updatedChapter);
  }

  async remove(user: User, chapterId: number): Promise<Chapter> {
    const chapter = await this.findOneByUser(user, chapterId);
    await this.chaptersRepository.delete(chapterId);
    return chapter;
  }

  //functions
  async findOneByUser(user: User, chapterId: number): Promise<Chapter> {
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
}
