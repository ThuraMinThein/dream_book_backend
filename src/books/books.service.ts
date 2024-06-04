import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import slugify from 'slugify';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from '../utils/enums/status.enum';
import { User } from '../users/entities/user.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Favorite } from '../favorites/entities/favorite.entity';
import { CategoriesService } from '../categories/categories.service';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';
import { InterestedCategoriesService } from '../interested-categories/interested-categories.service';
import { SortBy } from '../utils/enums/sortBy.enum';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private booksRepository: Repository<Book>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    private cloudinaryService: CloudinaryService,
    private categoriesService: CategoriesService,
    private interestedCategoriesService: InterestedCategoriesService,
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

  //get recommendted books by user interested categories
  async getRecommendedBookByUser(
    user: User,
    options: IPaginationOptions,
  ): Promise<Pagination<Book>> {
    const qb = this.booksRepository
      .createQueryBuilder('books')
      .where('books.status = :status', {
        status: Status.PUBLISHED,
      })
      .leftJoinAndSelect(`books.user`, 'user')
      .leftJoinAndSelect(`books.category`, 'category');

    const interestedCategories =
      await this.interestedCategoriesService.getInterestedCategoriesByUser(
        user,
      );
    if (interestedCategories.length > 0) {
      const categories = interestedCategories.map(
        (category) => category.categoryId,
      );
      qb.andWhere('books.category IN (:...categories)', {
        categories,
      });
    } else {
      qb.orderBy('books.created_at', 'DESC');
    }
    const paginatedBooks = await paginate<Book>(qb, options);
    if (paginatedBooks.items.length === 0) {
      throw new NotFoundException('No books found');
    }

    //jf user logged in check if the book is user's favorited book
    let isFavorite: boolean = false;
    if (user) {
      for (const book of paginatedBooks.items) {
        isFavorite = await this.isFavorite(user.userId, book.bookId);
        book.isFavorite = isFavorite;
      }
    }

    return paginatedBooks;
  }

  //find books from all users
  async findAll(
    options: IPaginationOptions,
    search: string,
    sortBy: SortBy,
    userId: number,
    popular: boolean,
    categoryIds: number[],
    user?: User,
  ): Promise<Pagination<Book>> {
    const qb = this.booksRepository
      .createQueryBuilder('books')
      .where('books.status = :status', {
        status: Status.PUBLISHED,
      })
      .leftJoinAndSelect(`books.user`, 'user')
      .leftJoinAndSelect(`books.category`, 'category');

    let searchResult = [];
    if (search) {
      searchResult = await qb
        .andWhere('books.title ILIKE :search', { search: `%${search}%` })
        .getMany();
    }
    if (searchResult.length === 0 && search) {
      qb.where('books.description ILIKE :search', {
        search: `%${search}%`,
      }).andWhere('books.status = :status', {
        status: Status.PUBLISHED,
      });
    }

    if (categoryIds.length > 0) {
      qb.andWhere('category.categoryId IN (:...categoryIds)', { categoryIds });
    }

    if (userId) {
      qb.andWhere('user.userId = :userId', { userId });
    }

    if (popular) {
      qb.orderBy('books.favoriteCount', 'DESC');
    }

    if (sortBy) {
      switch (sortBy) {
        case SortBy.ATOZ:
          qb.orderBy('books.title', 'ASC');
          break;
        case SortBy.ZTOA:
          qb.orderBy('books.title', 'DESC');
          break;
        case SortBy.LATEST:
          qb.orderBy('books.created_at', 'DESC');
          break;
      }
    }

    const paginatedBooks = await paginate<Book>(qb, options);

    if (paginatedBooks.items.length === 0) {
      throw new NotFoundException('No books found');
    }

    //jf user logged in check if the book is user's favorited book
    let isFavorite: boolean = false;
    if (user) {
      for (const book of paginatedBooks.items) {
        isFavorite = await this.isFavorite(user.userId, book.bookId);
        book.isFavorite = isFavorite;
      }
    }
    return paginatedBooks;
  }

  async findOne(bookId: number, user?: User): Promise<Book> {
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
    //if the user loggedin check if this book is user's favorited book
    let isFavorite: boolean = false;
    if (user) {
      isFavorite = await this.isFavorite(user.userId, bookId);
      book.isFavorite = isFavorite;
    }
    return book;
  }

  //find books from author
  async findAllByAuthor(
    user: User,
    sortBy: SortBy,
    options: IPaginationOptions,
  ): Promise<Pagination<Book>> {
    const qb = this.booksRepository
      .createQueryBuilder('books')
      .leftJoinAndSelect(`books.user`, 'user')
      .leftJoinAndSelect(`books.category`, 'category')
      .andWhere('user.userId = :userId', { userId: user.userId });

    if (sortBy) {
      switch (sortBy) {
        case SortBy.ATOZ:
          qb.orderBy('books.title', 'ASC');
          break;
        case SortBy.ZTOA:
          qb.orderBy('books.title', 'DESC');
          break;
        case SortBy.LATEST:
          qb.orderBy('books.created_at', 'DESC');
          break;
      }
    }

    const paginatedBooks = await paginate<Book>(qb, options);

    if (paginatedBooks.items.length === 0) {
      throw new NotFoundException('No books found');
    }
    return paginatedBooks;
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

  async increaseFavorite(bookId: number) {
    const book = await this.booksRepository.findOne({ where: { bookId } });
    const favoriteCount = book.favoriteCount + 1;
    const increasedFavorite = this.booksRepository.create({
      ...book,
      favoriteCount,
    });
    return this.booksRepository.save(increasedFavorite);
  }

  async decreaseFavorite(bookId: number) {
    const book = await this.booksRepository.findOne({ where: { bookId } });
    let favoriteCount = book.favoriteCount;
    if (favoriteCount > 0) {
      favoriteCount--;
    }
    const decreasedFavorite = this.booksRepository.create({
      ...book,
      favoriteCount,
    });
    return this.booksRepository.save(decreasedFavorite);
  }

  async isFavorite(userId: number, bookId: number): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        userId,
        bookId,
      },
    });
    return !!favorite;
  }
}
