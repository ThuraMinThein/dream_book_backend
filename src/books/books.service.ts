import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from '../utils/enums/status.enum';
import { User } from '../users/entities/user.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CategoriesService } from '../categories/categories.service';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private booksRepository: Repository<Book>,
    private cloudinaryService: CloudinaryService,
    private categoriesService: CategoriesService,
  ) {}

  //services

  async create(
    user: User,
    coverImage: Express.Multer.File,
    createBookDto: CreateBookDto,
  ): Promise<Book> {
    //create slug by title and user id
    const slug = this.createSlug(createBookDto.title, user.userId);

    //check if user already has a book with same title
    const hasSlug = await this.hasSlug(slug);
    if (hasSlug) throw new ConflictException('Duplicate book title');

    //find user entered category exists or not
    const category = await this.categoriesService.findOne(
      createBookDto.categoryId,
    );

    //store image in cloudinary
    let imageUrl: string;
    if (coverImage) {
      const { url } = await this.cloudinaryService.storeImage(
        coverImage,
        'book-images',
      );
      imageUrl = url;
    }

    //create book
    const newBook = this.booksRepository.create({
      ...createBookDto,
      slug,
      coverImage: imageUrl,
      category,
      user,
    });
    return this.booksRepository.save(newBook);
  }

  //find books from all users
  async findAll(): Promise<Book[]> {
    //have to add pagination

    const book = await this.booksRepository.find({
      where: {
        status: Status.PUBLISHED,
      },
      relations: {
        user: true,
        category: true,
      },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async findOne(bookId: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {
        bookId,
        status: Status.PUBLISHED,
      },
      relations: {
        user: true,
        category: true,
      },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  //find books from author
  async findAllByAuthor(user: User): Promise<Book[]> {
    const books = await this.booksRepository.find({
      where: {
        user: {
          userId: user.userId,
        },
      },
      relations: {
        user: true,
        category: true,
      },
    });
    if (books.length === 0) {
      throw new NotFoundException('No books found');
    }
    return books;
  }

  async findOneByAuthor(user: User, bookId: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {
        bookId,
        user: {
          userId: user.userId,
        },
      },
      relations: {
        user: true,
        category: true,
      },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async update(
    user: User,
    bookId: number,
    newCoverImage: Express.Multer.File,
    updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    //find book
    const book = await this.findOneByAuthor(user, bookId);

    //if user changed the title, gotta update the slug
    let slug = book.slug;
    if (updateBookDto?.title) {
      slug = this.createSlug(updateBookDto.title, user.userId);

      //check if user already has a book with same title
      const hasSlug = await this.hasSlug(slug);
      if (hasSlug) throw new ConflictException('Duplicate book title');
    }

    //if the user wants to change the image, replace image in cloudinary with new and old image
    let bookImage = book.coverImage;
    if (newCoverImage) {
      const { url } = await this.cloudinaryService.storeImage(
        newCoverImage,
        'book-cover-images',
      );
      bookImage = url;

      //delete old image in cloudinary if there is an image exists
      book?.coverImage &&
        (await this.cloudinaryService.deleteImage(book.coverImage));
    }

    //if user wants to change the category, find the category and update the book
    let category = book.category;
    if (updateBookDto?.categoryId) {
      category = await this.categoriesService.findOne(
        updateBookDto?.categoryId,
      );
    }

    //update book
    const updatedBook = this.booksRepository.create({
      ...book,
      slug,
      category,
      coverImage: bookImage,
      ...updateBookDto,
    });
    return this.booksRepository.save(updatedBook);
  }

  async remove(user: User, bookId: number): Promise<Book> {
    const book = await this.findOneByAuthor(user, bookId);
    //delete image in cloudinary if there is an image
    book.coverImage &&
      (await this.cloudinaryService.deleteImage(book.coverImage));

    await this.booksRepository.delete(bookId);
    return book;
  }

  //functions

  createSlug(title: string, userId: number) {
    const slug = slugify(title, {
      replacement: '-',
      remove: /[*+~,.()'"!:@]/g,
      lower: true,
    });

    return slug + '-' + userId;
  }

  async hasSlug(slug: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {
        slug,
      },
    });
    return book;
  }
}
