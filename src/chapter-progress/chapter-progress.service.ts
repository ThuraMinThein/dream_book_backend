import { Injectable } from '@nestjs/common';
import { CreateChapterProgressDto } from './dto/create-chapter-progress.dto';
import { UpdateChapterProgressDto } from './dto/update-chapter-progress.dto';

@Injectable()
export class ChapterProgressService {
  create(createChapterProgressDto: CreateChapterProgressDto) {
    return 'This action adds a new chapterProgress';
  }

  findAll() {
    return `This action returns all chapterProgress`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chapterProgress`;
  }

  update(id: number, updateChapterProgressDto: UpdateChapterProgressDto) {
    return `This action updates a #${id} chapterProgress`;
  }

  remove(id: number) {
    return `This action removes a #${id} chapterProgress`;
  }
}
