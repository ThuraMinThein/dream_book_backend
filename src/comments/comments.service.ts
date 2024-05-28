import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksService } from 'src/books/books.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
    private booksService: BooksService,
    private usresService: UsersService,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { userId, bookId } = createCommentDto;

    //check if user exists
    const user = await this.usresService.findOne(userId);

    //check if book exists
    const book = await this.booksService.findOne(bookId);

    //create comment
    const newComment = this.commentsRepository.create({
      ...createCommentDto,
      user,
      book,
    });

    return this.commentsRepository.save(newComment);
  }

  async findAll(): Promise<Comment[]> {
    const comments = await this.commentsRepository.find({
      relations: {
        user: true,
        book: true,
      },
    });
    return comments;
  }
}
