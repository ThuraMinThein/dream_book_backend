import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/Book.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/User.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private booksRepository: Repository<Book>,
    private usersService: UsersService,
  ) {}

  //functions

  //services

  async create(user: User, createBookDto: CreateBookDto): Promise<any> {
    const newBook = this.booksRepository.create({ ...createBookDto, user });
    return this.booksRepository.save(newBook);
  }

  async findAll(user: User): Promise<any> {
    const books = await this.booksRepository.find({
      where: {
        user: {
          userId: user.userId,
        },
      },
      relations: {
        user: true,
      },
    });
    return books;
  }

  async findOne(user: User, id: number): Promise<any> {
    const book = await this.booksRepository.findOne({
      where: {
        bookId: id,
        user: {
          userId: user.userId,
        },
      },
      relations: {
        user: true,
      },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async update(
    user: User,
    id: number,
    updateBookDto: UpdateBookDto,
  ): Promise<any> {
    const book = await this.findOne(user, id);
    const updatedBook = this.booksRepository.create({
      ...book,
      ...updateBookDto,
    });
    return this.booksRepository.save(updatedBook);
  }

  async remove(user: User, id: number): Promise<any> {
    const book = await this.findOne(user, id);
    const deletedBook = await this.booksRepository.delete(id);
    return { deletedBook, message: 'book deleted successfully' };
  }
}
