import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Request,
} from '@nestjs/common';
import { ChapterProgressService } from './chapter-progress.service';
import { CreateChapterProgressDto } from './dto/create-chapter-progress.dto';
import { UpdateChapterProgressDto } from './dto/update-chapter-progress.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.gurad';
import { GROUP_USER } from '../utils/serializers/group.serializer';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { Progress } from './entities/chapter-progress.entity';

@Controller({
  path: 'chapter-progress',
  version: '1',
})
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
    return this.chapterProgressService.create(
      req.user,
      createChapterProgressDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCurrentChapter(@Request() req: CustomRequest): Promise<any> {
    return this.chapterProgressService.getCurrentChapter(req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: CustomRequest,
    @Param('id') id: string,
    @Body() updateChapterProgressDto: UpdateChapterProgressDto,
  ) {
    return this.chapterProgressService.update(
      req.user,
      +id,
      updateChapterProgressDto,
    );
  }
}
