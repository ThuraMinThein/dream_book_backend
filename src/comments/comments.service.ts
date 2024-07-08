import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { User } from '../users/entities/user.entity';
import { CommentsGateway } from './comments.gateway';
import { BooksService } from '../books/books.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

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
    const { slug } = createCommentDto;

    //check if book exists
    const book = await this.booksService.findOneWithSlug(slug);

    //create comment
    const newComment = this.commentsRepository.create({
      ...createCommentDto,
      user,
      book,
    });

    const comment = await this.commentsRepository.save(newComment);
    this.commentsGateway.handleNewComment(comment);
    return comment;
  }

  async findAll(slug: string, options: any): Promise<Pagination<Comment>> {
    const { limit, page } = options;

    //check if book exists
    const book = await this.booksService.findOneWithSlug(slug);

    const totalItems = await this.commentsRepository.count({
      where: {
        book: {
          slug: slug,
        },
      },
    });

    const comments = await this.commentsRepository.find({
      where: {
        book: {
          slug: slug,
        },
      },
      relations: {
        user: true,
        replies: { user: true },
      },
      order: {
        createdAt: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    comments.forEach((comment) => {
      comment.replies.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
    });

    const totalPages = Math.ceil(totalItems / limit);
    const meta = {
      totalItems: totalItems,
      itemCount: comments.length,
      itemsPerPage: limit,
      totalPages: totalPages,
      currentPage: page,
    };

    return {
      items: comments,
      meta,
    };
  }

  async findOneByUserToDelete(user: User, commentId: number): Promise<Comment> {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.book', 'book')
      .where('comment.comment_id = :commentId', { commentId })
      .andWhere('comment.user_id = :userId', { userId: user.userId })
      .orWhere('book.user_id = :userId', { userId: user.userId })
      .getOne();
    if (!comment) throw new NotFoundException('comment not found');
    return comment;
  }

  async findOneByUserToUpdate(user: User, commentId: number): Promise<Comment> {
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
    const comment = await this.findOneByUserToUpdate(user, id);

    const updatedComment = this.commentsRepository.create({
      ...comment,
      ...updateCommentDto,
    });

    return this.commentsRepository.save(updatedComment);
  }

  async remove(user: User, id: number): Promise<Comment> {
    //check if comment exists
    const comment = await this.findOneByUserToDelete(user, id);
    await this.commentsRepository.delete(id);

    this.commentsGateway.handleDeleteComment(id);
    return comment;
  }
}
