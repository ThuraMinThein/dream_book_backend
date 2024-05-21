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
import { TypeormExceptionFilter } from 'src/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'comments',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
}
