import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
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
    //find user entered category exists or not
    const category = await this.categoriesService.findOne(
      createBookDto.categoryId,
    );

    //create slug by title and user id
    const slug = this.createSlug(createBookDto.title, user.userId);

    //check if user already has a book with same title
    const book = await this.hasSlug(slug);
    if (book) throw new ConflictException('Duplicate book title');

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

  async findAll(): Promise<Book[]> {
    const book = await this.booksRepository.find({
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

  async findAllByUser(user: User): Promise<Book[]> {
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

  async findOne(bookId: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {
        bookId,
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
    const book = await this.findOneByUser(user, bookId);

    //if the user wants to change the image, replace image in cloudinary with new and old image
    let bookImage = book.coverImage;
    if (newCoverImage) {
      const { url } = await this.cloudinaryService.storeImage(
        newCoverImage,
        'book-cover-images',
      );
      bookImage = url;

      //delete old image in cloudinary if there is an image exists
      if (book.coverImage)
        await this.cloudinaryService.deleteImage(book.coverImage);
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
      category,
      coverImage: bookImage,
      ...updateBookDto,
    });
    return this.booksRepository.save(updatedBook);
  }

  async remove(user: User, bookId: number): Promise<Book> {
    const book = await this.findOneByUser(user, bookId);
    //delete image in cloudinary if there is an image
    if (book.coverImage)
      await this.cloudinaryService.deleteImage(book.coverImage);

    await this.booksRepository.delete(bookId);
    return book;
  }

  //functions

  async findOneByUser(user: User, bookId: number): Promise<Book> {
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

  createSlug(title: string, bookId: number) {
    const slug = slugify(title, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true,
    });

    return slug + '-' + bookId;
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
