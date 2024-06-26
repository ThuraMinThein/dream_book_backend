import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { BooksService } from '../books/books.service';
import { Progress } from './entities/chapter-progress.entity';
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
    const { slug, chapterId } = createChapterProgressDto;
    //check if book and chapter exists
    const book = await this.booksService.findOneWithSlug(slug);
    const chapter = await this.ChaptersService.findOne(chapterId);

    //check for duplicate progress
    const hasProgress = await this.findOneByUser(user.userId, slug);
    if (hasProgress) throw new ConflictException('duplicate progress');

    const progress = this.progressesRepository.create({
      ...createChapterProgressDto,
      user,
      book,
      chapter,
    });
    return this.progressesRepository.save(progress);
  }

  async getCurrentChapter(user: User, slug: string): Promise<any> {
    const { userId } = user;
    await this.booksService.findOneWithSlug(slug);
    const currentProgress = await this.progressesRepository.findOne({
      where: {
        userId,
        book: {
          slug,
        },
      },
      relations: {
        chapter: true,
        book: true,
        user: true,
      },
    });
    if (!currentProgress) throw new NotFoundException('Progress not found');
    return currentProgress;
  }

  async findOneByUser(userId: number, slug: string): Promise<Progress> {
    const progress = await this.progressesRepository.findOne({
      where: {
        book: {
          slug,
        },
        user: {
          userId,
        },
      },
    });
    return progress;
  }

  async update(
    user: User,
    slug: string,
    updateChapterProgressDto: UpdateChapterProgressDto,
  ): Promise<Progress> {
    const { chapterId } = updateChapterProgressDto;

    const chapter = await this.ChaptersService.findOne(chapterId);
    //check if progress exists
    const progress = await this.findOneByUser(user.userId, slug);
    if (!progress) throw new NotFoundException('Progress not found');

    const updatedProgress = this.progressesRepository.create({
      ...progress,
      ...chapter,
    });
    return this.progressesRepository.save(updatedProgress);
  }
}
