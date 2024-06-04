import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { BooksService } from '../books/books.service';
import { Progress } from './entities/chapter-progress.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ChaptersService } from '../chapters/chapters.service';
import { CreateChapterProgressDto } from './dto/create-chapter-progress.dto';
import { UpdateChapterProgressDto } from './dto/update-chapter-progress.dto';

@Injectable()
export class ChapterProgressService {
  constructor(
    @InjectRepository(Progress)
    private progressesRepository: Repository<Progress>,
    private booksService: BooksService,
    private ChaptersService: ChaptersService,
  ) {}

  async create(
    user: User,
    createChapterProgressDto: CreateChapterProgressDto,
  ): Promise<Progress> {
    const { bookId, chapterId } = createChapterProgressDto;
    //check if book and chapter exists
    const book = await this.booksService.findOne(bookId);
    const chapter = await this.ChaptersService.findOne(chapterId);

    const progress = this.progressesRepository.create({
      ...createChapterProgressDto,
      user,
      book,
      chapter,
    });
    return this.progressesRepository.save(progress);
  }

  async getCurrentChapter(user: User): Promise<any> {
    const currentProgress = await this.progressesRepository.findOne({
      where: {
        userId: user.userId,
      },
    });
    if (!Progress) return 0;
    return currentProgress;
  }

  async findOneByUser(userId: number, progressId: number): Promise<Progress> {
    const progress = await this.progressesRepository.findOne({
      where: {
        progressId,
        user: {
          userId,
        },
      },
    });
    if (!progress) throw new NotFoundException('Progress not found');
    return progress;
  }

  async update(
    user: User,
    id: number,
    updateChapterProgressDto: UpdateChapterProgressDto,
  ): Promise<Progress> {
    //check if progress exists
    const progress = await this.findOneByUser(user.userId, id);

    const updatedProgress = this.progressesRepository.create({
      ...progress,
      ...updateChapterProgressDto,
    });
    return this.progressesRepository.save(updatedProgress);
  }
}
