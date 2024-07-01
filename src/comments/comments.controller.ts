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
  UseInterceptors,
  DefaultValuePipe,
  SerializeOptions,
  BadRequestException,
  ClassSerializerInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './comments.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { GROUP_USER } from '../common/utils/serializers/group.serializer';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'comments',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async create(
    @Request() req: CustomRequest,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    try {
      return this.commentsService.create(req.user, createCommentDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while creating comment');
    }
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findAll(
    @Query('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Pagination<Comment>> {
    if (!slug)
      throw new BadRequestException('You must add book slug as query param');

    const options = {
      page,
      limit,
    };
    try {
      return this.commentsService.findAll(slug, options);
    } catch (error) {
      throw new InternalServerErrorException('Error while fetching comments');
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async update(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) id: any,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      return this.commentsService.update(req.user, id, updateCommentDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while updating comment');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async remove(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) id: any,
  ): Promise<Comment> {
    try {
      return this.commentsService.remove(req.user, id);
    } catch (error) {
      throw new InternalServerErrorException('Error while deleting comment');
    }
  }
}
