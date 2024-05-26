import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChapterProgressService } from './chapter-progress.service';
import { CreateChapterProgressDto } from './dto/create-chapter-progress.dto';
import { UpdateChapterProgressDto } from './dto/update-chapter-progress.dto';

@Controller('chapter-progress')
export class ChapterProgressController {
  constructor(private readonly chapterProgressService: ChapterProgressService) {}

  @Post()
  create(@Body() createChapterProgressDto: CreateChapterProgressDto) {
    return this.chapterProgressService.create(createChapterProgressDto);
  }

  @Get()
  findAll() {
    return this.chapterProgressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chapterProgressService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChapterProgressDto: UpdateChapterProgressDto) {
    return this.chapterProgressService.update(+id, updateChapterProgressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chapterProgressService.remove(+id);
  }
}
