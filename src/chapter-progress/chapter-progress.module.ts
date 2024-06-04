import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from '../books/books.module';
import { ChaptersModule } from '../chapters/chapters.module';
import { Progress } from './entities/chapter-progress.entity';
import { ChapterProgressService } from './chapter-progress.service';
import { ChapterProgressController } from './chapter-progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Progress]), BooksModule, ChaptersModule],
  controllers: [ChapterProgressController],
  providers: [ChapterProgressService],
})
export class ChapterProgressModule {}
