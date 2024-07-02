import {
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Controller,
  ParseIntPipe,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ReplyComment } from './entities/reply-comment.entity';
import { ReplyCommentsService } from './reply-comments.service';
import { CreateReplyDto } from './dto/create-reply-comment.dto';
import { UpdateReplyDto } from './dto/update-reply-comment.dto';
import { GROUP_USER } from '../common/utils/serializers/group.serializer';
import { CustomRequest } from '../common/interfaces/custom-request.interface';

@Controller({
  path: 'reply-comments',
  version: '1',
})
export class ReplyCommentsController {
  constructor(private readonly replyCommentsService: ReplyCommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async create(
    @Request() req: CustomRequest,
    @Body() createReplyDto: CreateReplyDto,
  ): Promise<ReplyComment> {
    try {
      return this.replyCommentsService.create(req.user, createReplyDto);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while creating reply comment',
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async update(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReplyDto: UpdateReplyDto,
  ): Promise<ReplyComment> {
    try {
      return this.replyCommentsService.update(req.user, id, updateReplyDto);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while updating reply comment',
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async remove(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) id: any,
  ): Promise<ReplyComment> {
    try {
      return this.replyCommentsService.remove(req.user, id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while deleting reply comment',
      );
    }
  }
}
