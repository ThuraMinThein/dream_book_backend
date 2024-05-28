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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { TypeormExceptionFilter } from 'src/common/filters/exceptionfilters/typeorm-exception.filter';
import { Comment } from './entities/comment.entity';

@Controller({
  path: 'comments',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto): Promise<Comment> {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  async findAll(): Promise<Comment[]> {
    return this.commentsService.findAll();
  }
}
