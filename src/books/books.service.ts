import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  paginate,
  Pagination,
  IPaginationMeta,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import slugify from 'slugify';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from '../utils/enums/status.enum';
import { SortBy } from '../utils/enums/sortBy.enum';
import { User } from '../users/entities/user.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Favorite } from '../favorites/entities/favorite.entity';
import { CategoriesService } from '../categories/categories.service';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';
import { InterestedCategoriesService } from '../interested-categories/interested-categories.service';

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
    const hasSlug = await this.checkDuplicateSlug(slug);

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

  //find recommendted books by user interested categories if user logged in
  async getRecommendedBookByUser(
    options: IPaginationOptions,
    user?: User,
  ): Promise<Pagination<Book>> {
    const qb = this.publishedBooksWithUserAndCategory();

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
    await this.setFavoriteManyBooks(paginatedBooks, user);

    return paginatedBooks;
  }

  //find popular books based on users' favorites
  async getPopularBooks(
    user: User,
    options: IPaginationOptions,
  ): Promise<Pagination<Book>> {
    const qb = this.publishedBooksWithUserAndCategory().orderBy(
      'books.favoriteCount',
      'DESC',
    );

    const paginatedBooks = await paginate<Book>(qb, options);

    if (paginatedBooks.items.length === 0) {
      throw new NotFoundException('No books found');
    }

    //jf user logged in check if the book is user's favorited book
    await this.setFavoriteManyBooks(paginatedBooks, user);

    return paginatedBooks;
  }

  //find books from all users
  async findAll(
    options: IPaginationOptions,
    search: string,
    sortBy: SortBy,
    userId: number,
    categoryIds: number[],
    user?: User,
  ): Promise<Pagination<Book>> {
    const qb = this.publishedBooksWithUserAndCategory();

    //search with title keywords and description
    if (search) {
      // search with book title first
      let searchResult: Book[] = await qb
        .andWhere('books.title ILIKE :search', {
          search: `%${search}%`,
        })
        .getMany();
      // if there is nothing match with book title, search with keywords
      if (searchResult.length === 0) {
        searchResult = await qb
          .where(
            'EXISTS (SELECT 1 FROM unnest(books.keywords) keyword WHERE keyword ILIKE :search)',
            { search: `%${search}%` },
          )
          .andWhere('books.status =:status', { status: Status.PUBLISHED })
          .getMany();
      }
      // if nothing match with keywords, then search with description
      if (searchResult.length === 0) {
        qb.where('books.description ILIKE :search', {
          search: `%${search}%`,
        }).andWhere('books.status =:status', { status: Status.PUBLISHED });
      }
    }

    if (categoryIds.length > 0) {
      qb.andWhere('category.categoryId IN (:...categoryIds)', { categoryIds });
    }

    if (userId) {
      qb.andWhere('user.userId = :userId', { userId });
    }

    //sort books
    this.sortBooks(sortBy, qb);

    const paginatedBooks = await paginate<Book>(qb, options);

    if (paginatedBooks.items.length === 0) {
      throw new NotFoundException('No books found');
    }

    //jf user logged in check if the book is user's favorite book
    await this.setFavoriteManyBooks(paginatedBooks, user);

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
    await this.setFavoriteOneBook(book, user);

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

    //sort books
    this.sortBooks(sortBy, qb);

    const paginatedBooks = await paginate<Book>(qb, options);

    if (paginatedBooks.items.length === 0) {
      throw new NotFoundException('No books found');
    }

    //check these books are user's favorite books or not
    await this.setFavoriteManyBooks(paginatedBooks, user);

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

    //check if this book is author favorite book or not
    await this.setFavoriteOneBook(book, user);

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
      await this.checkDuplicateSlug(slug, book.slug);
    }

    //if user wants to change the category, find the category and update the book
    let category = book.category;
    if (updateBookDto?.categoryId) {
      category = await this.categoriesService.findOne(
        updateBookDto?.categoryId,
      );
    }

    //if the user wants to change the image, replace image in cloudinary with new and old image
    let bookImage = book.coverImage;
    if (newCoverImage) {
      const { url } = await this.cloudinaryService.storeImage(
        newCoverImage,
        'book-images',
      );
      bookImage = url;

      //delete old image in cloudinary if there is an image exists
      book?.coverImage &&
        (await this.cloudinaryService.deleteImage(book.coverImage));
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

  async softDelete(user: User, bookId: number): Promise<Book> {
    const book = await this.findOneByAuthor(user, bookId);

    await this.booksRepository.softDelete(bookId);
    return book;
  }

  async restore(user: User, bookId: number): Promise<Book> {
    const deletedBook = await this.getOneSoftDeletedBook(user, bookId);
    await this.booksRepository.restore(bookId);
    return deletedBook;
  }

  async remove(user: User, bookId: number): Promise<Book> {
    const book = await this.getOneSoftDeletedBook(user, bookId);
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

  async checkDuplicateSlug(slug: string, oldSlug?: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {
        slug,
      },
    });
    if (book) {
      if (!oldSlug || oldSlug !== slug) {
        throw new ConflictException('Duplicate book title');
      }
    }

    return book;
  }

  publishedBooksWithUserAndCategory(): SelectQueryBuilder<Book> {
    return this.booksRepository
      .createQueryBuilder('books')
      .where('books.status = :status', {
        status: Status.PUBLISHED,
      })
      .leftJoinAndSelect(`books.user`, 'user')
      .leftJoinAndSelect(`books.category`, 'category');
  }

  async getAllSoftDeletedBooks(user: User): Promise<Book[]> {
    const deletedBooks = await this.booksRepository
      .createQueryBuilder('books')
      .withDeleted()
      .leftJoinAndSelect(`books.user`, 'user')
      .leftJoinAndSelect(`books.category`, 'category')
      .where('user.userId =:userId', { userId: user.userId })
      .andWhere('books.deleted_at IS NOT NULL ')
      .getMany();

    if (deletedBooks.length === 0)
      throw new NotFoundException("You haven't deleted any books");

    return deletedBooks;
  }

  async getOneSoftDeletedBook(user: User, bookId: number): Promise<Book> {
    const deletedBook = await this.booksRepository
      .createQueryBuilder('books')
      .withDeleted()
      .leftJoinAndSelect(`books.user`, 'user')
      .leftJoinAndSelect(`books.category`, 'category')
      .where('user.userId =:userId', { userId: user.userId })
      .andWhere('books.bookId =:bookId', { bookId })
      .andWhere('books.deleted_at IS NOT NULL ')
      .getOne();

    if (!deletedBook)
      throw new NotFoundException('No book is deleted with this id');
    return deletedBook;
  }

  async sortBooks(sortBy: SortBy, qb: SelectQueryBuilder<Book>) {
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
      case SortBy.OLDEST:
        qb.orderBy('books.created_at', 'ASC');
        break;
    }
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

  async setFavoriteManyBooks(
    paginatedBooks: Pagination<Book, IPaginationMeta>,
    user?: User,
  ) {
    let isFavorite: boolean = false;
    if (user) {
      for (const book of paginatedBooks.items) {
        isFavorite = await this.isFavorite(user.userId, book.bookId);
        book.isFavorite = isFavorite;
      }
    }
  }

  async setFavoriteOneBook(book: Book, user?: User) {
    let isFavorite: boolean = false;
    if (user) {
      isFavorite = await this.isFavorite(user.userId, book.bookId);
      book.isFavorite = isFavorite;
    }
  }
}
