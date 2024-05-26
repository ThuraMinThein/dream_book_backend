import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/Book.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/User.entity';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';
import { CategoriesService } from 'src/categories/categories.service';

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
    //store image in cloudinary
    let imageUrl: string;
    if (coverImage) {
      const { url } = await this.cloudinaryService.storeImage(
        coverImage,
        'book-images',
      );
      imageUrl = url;
    }

    //find user entered category exists of not
    const category = await this.categoriesService.findOne(
      createBookDto.categoryId,
    );

    //create book
    const newBook = this.booksRepository.create({
      ...createBookDto,
      coverImage: imageUrl,
      category,
      user,
    });
    return this.booksRepository.save(newBook);
  }

  async bookFromAllUsers(): Promise<Book[]> {
    const book = await this.booksRepository.find();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async findAll(user: User): Promise<Book[]> {
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

  async findOne(user: User, bookId: number): Promise<Book> {
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
    const book = await this.findOne(user, bookId);

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
      coverImage: bookImage,
      ...updateBookDto,
    });
    return this.booksRepository.save(updatedBook);
  }

  async remove(user: User, bookId: number): Promise<Book> {
    const book = await this.findOne(user, bookId);
    //delete image in cloudinary if there is an image
    if (book.coverImage)
      await this.cloudinaryService.deleteImage(book.coverImage);

    await this.booksRepository.delete(bookId);
    return book;
  }

  //functions
}
