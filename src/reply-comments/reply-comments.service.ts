import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReplyComment } from './entities/reply-comment.entity';
import { CommentsService } from '../comments/comments.service';
import { UpdateReplyDto } from './dto/update-reply-comment.dto';
import { CreateReplyDto } from './dto/create-reply-comment.dto';

@Injectable()
export class ReplyCommentsService {
  constructor(
    @InjectRepository(ReplyComment)
    private replyCommentsRepository: Repository<ReplyComment>,
    private commentsService: CommentsService,
  ) {}

  async create(
    user: User,
    createReplyDto: CreateReplyDto,
  ): Promise<ReplyComment> {
    const { replyTo } = createReplyDto;

    //check if the parent comment exists
    const parentComment = await this.commentsService.findOne(replyTo);

    const newReplyComment = this.replyCommentsRepository.create({
      ...createReplyDto,
      user,
      parentComment,
    });

    return this.replyCommentsRepository.save(newReplyComment);
  }

  async findOneByUser(user: User, id: number): Promise<ReplyComment> {
    const replyComment = await this.replyCommentsRepository.findOne({
      where: {
        id,
        user: {
          userId: user.userId,
        },
      },
    });
    if (!replyComment) {
      throw new NotFoundException(`Reply comment not found`);
    }
    return replyComment;
  }

  async update(
    user: User,
    id: number,
    updateReplyDto: UpdateReplyDto,
  ): Promise<ReplyComment> {
    //check if comment exists
    const comment = await this.findOneByUser(user, id);

    const updatedReplyComment = this.replyCommentsRepository.create({
      ...comment,
      ...updateReplyDto,
    });

    return this.replyCommentsRepository.save(updatedReplyComment);
  }

  async remove(user: User, id: number): Promise<ReplyComment> {
    //check if comment exists
    const comment = await this.findOneByUser(user, id);
    await this.replyCommentsRepository.delete(id);

    return comment;
  }
}
