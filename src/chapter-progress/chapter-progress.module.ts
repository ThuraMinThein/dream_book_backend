import { Module } from '@nestjs/common';
import { ChapterProgressService } from './chapter-progress.service';
import { ChapterProgressController } from './chapter-progress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './entities/chapter-progress.entity';
import { BooksModule } from '../books/books.module';
import { ChaptersModule } from '../chapters/chapters.module';

@Module({
  imports: [TypeOrmModule.forFeature([Progress]), BooksModule, ChaptersModule],
  controllers: [ChapterProgressController],
  providers: [ChapterProgressService],
})
export class ChapterProgressModule {}
