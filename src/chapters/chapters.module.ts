import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter])],
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
