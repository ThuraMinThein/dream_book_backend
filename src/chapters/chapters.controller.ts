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
    @Req() req: CustomRequest,
    @Body() createChapterDto: CreateChapterDto,
  ): Promise<Chapter> {
    return this.chaptersService.create(req.user, createChapterDto);
  }

  @Get()
  async findAll(): Promise<Chapter[]> {
    return this.chaptersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Chapter> {
    return this.chaptersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: CustomRequest,
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
  ): Promise<Chapter> {
    return this.chaptersService.update(req.user, +id, updateChapterDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: CustomRequest,
    @Param('id') id: string,
  ): Promise<Chapter> {
    return this.chaptersService.remove(req.user, +id);
  }
}
