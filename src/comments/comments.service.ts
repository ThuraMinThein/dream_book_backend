import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { BooksService } from '../books/books.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
    private booksService: BooksService,
  ) {}

  async create(
    user: User,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const { slug } = createCommentDto;

    //check if book exists
    const book = await this.booksService.findOneWithSlug(slug);

    //create comment
    const newComment = this.commentsRepository.create({
      ...createCommentDto,
      user,
      book,
    });

    return this.commentsRepository.save(newComment);
  }

  async findAll(slug: string): Promise<Comment[]> {
    //check if book exists
    await this.booksService.findOneWithSlug(slug);

    const comments = await this.commentsRepository.find({
      where: {
        book: {
          slug,
        },
      },
      relations: {
        user: true,
        book: true,
      },
    });
    if (comments.length === 0)
      throw new NotFoundException('No comments yet :(');
    return comments;
  }

  async findOneByUser(user: User, commentId: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: {
        commentId,
        user: {
          userId: user.userId,
        },
      },
      relations: {
        user: true,
        book: true,
      },
    });
    if (!comment) throw new NotFoundException('comment not found');
    return comment;
  }

  async update(
    user: User,
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    //check if comment exists;
    const comment = await this.findOneByUser(user, id);

    const updatedComment = this.commentsRepository.create({
      ...comment,
      ...updateCommentDto,
    });

    return updatedComment;
  }

  async remove(user: User, id: number): Promise<Comment> {
    //check if comment exists
    const comment = await this.findOneByUser(user, id);
    await this.commentsRepository.delete(id);
    return comment;
  }
}
