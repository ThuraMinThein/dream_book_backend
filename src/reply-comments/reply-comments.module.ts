import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from '../comments/comments.module';
import { ReplyComment } from './entities/reply-comment.entity';
import { ReplyCommentsService } from './reply-comments.service';
import { ReplyCommentsController } from './reply-comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReplyComment]), CommentsModule],
  controllers: [ReplyCommentsController],
  providers: [ReplyCommentsService],
})
export class ReplyCommentsModule {}
