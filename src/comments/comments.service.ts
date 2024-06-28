import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
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
    const { slug, parentCommentId } = createCommentDto;

    //check if book exists
    const book = await this.booksService.findOneWithSlug(slug);

    //check if new comment is a reply to an existing comment
    let parentComment: Comment;
    if (parentCommentId) {
      parentComment = await this.findOne(parentCommentId);
    }

    //create comment
    const newComment = this.commentsRepository.create({
      ...createCommentDto,
      user,
      book,
      parentComment,
    });

    return this.commentsRepository.save(newComment);
  }

  async findAll(
    slug: string,
    options: IPaginationOptions,
  ): Promise<Pagination<Comment>> {
    //check if book exists
    await this.booksService.findOneWithSlug(slug);

    const qb = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoin('comment.book', 'book')
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'repliesUser')
      .leftJoinAndSelect('replies.replies', 'subReplies')
      .leftJoinAndSelect('subReplies.user', 'subRepliesUser')
      .where('book.slug = :slug', { slug })
      .andWhere('comment.parentComment IS NULL');

    const paginatedComments = await paginate<Comment>(qb, options);
    if (paginatedComments.items.length === 0)
      throw new NotFoundException('No comments yet :(');
    return paginatedComments;
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

  async findOne(commentId: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: {
        commentId,
      },
      relations: {
        user: true,
        book: true,
      },
    });
    if (!comment) throw new NotFoundException('Parent comment not found');
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

    return this.commentsRepository.save(updatedComment);
  }

  async remove(user: User, id: number): Promise<Comment> {
    //check if comment exists
    const comment = await this.findOneByUser(user, id);
    await this.commentsRepository.delete(id);
    return comment;
  }
}
