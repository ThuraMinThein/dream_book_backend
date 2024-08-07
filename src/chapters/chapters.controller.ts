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
  ParseIntPipe,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Chapter } from './entities/chapter.entity';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'chapters',
  version: '1',
})
@UseGuards(JwtAuthGuard)
@UseFilters(TypeormExceptionFilter)
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  async create(
    @Request() req: CustomRequest,
    @Body() createChapterDto: CreateChapterDto,
  ): Promise<Chapter> {
    try {
      return this.chaptersService.create(req.user, createChapterDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while creating chapter');
    }
  }

  //get chapters from all users created books
  @Get('public')
  async findAll(@Query('slug') bookSlug: string): Promise<Chapter[]> {
    if (!bookSlug)
      throw new BadRequestException('You must add book id as query param');
    try {
      return this.chaptersService.findAll(bookSlug);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching published chapters',
      );
    }
  }

  @Get('public/:id')
  async findOne(@Param('id', ParseIntPipe) id: any): Promise<Chapter> {
    try {
      return this.chaptersService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while fetching published chapterId: ${id}`,
      );
    }
  }

  //get chapters from author created books
  @Get('author')
  async findAllByAuthor(
    @Request() req: CustomRequest,
    @Query('slug') slug: string,
  ) {
    if (!slug)
      throw new BadRequestException('You must add book id as query param');
    try {
      return this.chaptersService.findAllByAuthor(req.user, slug);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching author created chapters',
      );
    }
  }

  @Get('author/:id')
  async findOneByAuthor(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) chapterId: any,
  ) {
    try {
      return this.chaptersService.findOneByAuthor(req.user, chapterId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while fetching author created chapterId: ${chapterId}`,
      );
    }
  }

  @Patch(':id')
  async update(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) id: any,
    @Body() updateChapterDto: UpdateChapterDto,
  ): Promise<Chapter> {
    try {
      return this.chaptersService.update(req.user, id, updateChapterDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while updating chapter');
    }
  }

  @Delete(':id')
  async remove(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) id: any,
  ): Promise<Chapter> {
    try {
      return this.chaptersService.remove(req.user, id);
    } catch (error) {
      throw new InternalServerErrorException('Error while deleting chapter');
    }
  }
}
