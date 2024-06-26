import {
  Get,
  Post,
  Body,
  Patch,
  Query,
  Request,
  UseGuards,
  Controller,
  UseFilters,
  UseInterceptors,
  SerializeOptions,
  NotFoundException,
  ClassSerializerInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Progress } from './entities/chapter-progress.entity';
import { ChapterProgressService } from './chapter-progress.service';
import { GROUP_USER } from '../common/utils/serializers/group.serializer';
import { CreateChapterProgressDto } from './dto/create-chapter-progress.dto';
import { UpdateChapterProgressDto } from './dto/update-chapter-progress.dto';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'chapter-progress',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class ChapterProgressController {
  constructor(
    private readonly chapterProgressService: ChapterProgressService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async create(
    @Request() req: CustomRequest,
    @Body() createChapterProgressDto: CreateChapterProgressDto,
  ): Promise<Progress> {
    try {
      return this.chapterProgressService.create(
        req.user,
        createChapterProgressDto,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while creating chapter progress',
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCurrentChapter(
    @Request() req: CustomRequest,
    @Query('slug') slug: string,
  ): Promise<any> {
    if (!slug) throw new NotFoundException('Slug must not be empty');
    try {
      return this.chapterProgressService.getCurrentChapter(req.user, slug);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching current chapter',
      );
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: CustomRequest,
    @Query('slug') slug: string,
    @Body() updateChapterProgressDto: UpdateChapterProgressDto,
  ): Promise<Progress> {
    if (!slug) throw new NotFoundException('Slug must not be empty');
    try {
      return this.chapterProgressService.update(
        req.user,
        slug,
        updateChapterProgressDto,
      );
    } catch (error) {
      throw new InternalServerErrorException('Error while updating progress');
    }
  }
}
