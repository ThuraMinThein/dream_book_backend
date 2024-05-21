import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { TypeormExceptionFilter } from 'src/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'chapters',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}
}
