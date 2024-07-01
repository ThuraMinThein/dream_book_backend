import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { CommentsGateway } from './comments.gateway';
import { BooksService } from '../books/books.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
    private booksService: BooksService,
    private commentsGateway: CommentsGateway,
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

      //check if this comment is replying to a child comment and then throw error
      if (parentComment.replyTo) {
        throw new BadRequestException('Cannot reply to a child comment');
      }
    }

    //create comment
    const newComment = this.commentsRepository.create({
      ...createCommentDto,
      user,
      book,
      parentComment,
    });

    const comment = await this.commentsRepository.save(newComment);
    this.commentsGateway.handleNewComment(comment);
    return comment;
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
      .where('book.slug = :slug', { slug })
      .andWhere('comment.parentComment IS NULL');

    const paginatedComments = await paginate<Comment>(qb, options);
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

    this.commentsGateway.handleDeleteComment(id);
    return comment;
  }
}
