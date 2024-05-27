import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { TypeormExceptionFilter } from 'src/common/filters/exceptionfilters/typeorm-exception.filter';
import { CustomRequest } from 'src/common/interfaces/custom-request.interface';
import { Chapter } from './entities/chapter.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.gurad';
import { BooksService } from 'src/books/books.service';

@Controller({
  path: 'chapters',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class ChaptersController {
  constructor(
    private readonly chaptersService: ChaptersService,
    private readonly booksService: BooksService,
  ) {}

  @Post(':bookId')
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: CustomRequest,
    @Param('bookId') bookId: string,
    @Body() createChapterDto: CreateChapterDto,
  ): Promise<Chapter> {
    return this.chaptersService.create(req.user, +bookId, createChapterDto);
  }

  @Get(':bookId')
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() req: CustomRequest,
    @Param('bookId') bookId: string,
  ): Promise<Chapter[]> {
    return this.chaptersService.findAll(req.user, +bookId);
  }

  @Get(':bookId/:chapterId')
  async findOne(
    @Param('bookId') bookId: number,
    @Param('chapterId') chapterId: number,
  ): Promise<Chapter> {
    return this.chaptersService.findOne(+bookId, +chapterId);
  }

  @Patch(':bookId/:chapterId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('bookId') bookId: string,
    @Param('chapterId') chapterId: string,
    @Body() updateChapterDto: UpdateChapterDto,
  ): Promise<Chapter> {
    return this.chaptersService.update(+bookId, +chapterId, updateChapterDto);
  }

  @Delete(':bookId/:chapterId')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('bookId') bookId: string,
    @Param('chapterId') chapterId: string,
  ): Promise<Chapter> {
    return this.chaptersService.remove(+bookId, +chapterId);
  }
}
