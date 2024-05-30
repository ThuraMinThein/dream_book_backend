import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  Request,
  UseGuards,
  UseFilters,
  Controller,
  BadRequestException,
} from '@nestjs/common';
import { Chapter } from './entities/chapter.entity';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.gurad';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'chapters',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: CustomRequest,
    @Body() createChapterDto: CreateChapterDto,
  ): Promise<Chapter> {
    return this.chaptersService.create(req.user, createChapterDto);
  }

  //get chapters from all users created books
  @Get('public')
  async findAll(@Query('book_id') bookId: number): Promise<Chapter[]> {
    if (!bookId)
      throw new BadRequestException('You must add book id as query param');
    return this.chaptersService.findAll(bookId);
  }

  @Get('public/:id')
  async findOne(@Param('id') id: number): Promise<Chapter> {
    return this.chaptersService.findOne(+id);
  }

  //get chapters from author created books
  @Get('author')
  @UseGuards(JwtAuthGuard)
  async findAllByAuthor(
    @Request() req: CustomRequest,
    @Query('book_id') bookId: number,
  ) {
    if (!bookId)
      throw new BadRequestException('You must add book id as query param');
    return this.chaptersService.findAllByAuthor(req.user, bookId);
  }

  @Get('author/:id')
  @UseGuards(JwtAuthGuard)
  async findOneByAuthor(
    @Request() req: CustomRequest,
    @Param('id') chapterId: string,
  ) {
    return this.chaptersService.findOneByAuthor(req.user, +chapterId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: CustomRequest,
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
  ): Promise<Chapter> {
    return this.chaptersService.update(req.user, +id, updateChapterDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Request() req: CustomRequest,
    @Param('id') id: string,
  ): Promise<Chapter> {
    return this.chaptersService.remove(req.user, +id);
  }
}
