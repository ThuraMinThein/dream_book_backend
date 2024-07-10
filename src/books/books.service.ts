import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
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
import { User } from '../users/entities/user.entity';
import { addDays, differenceInDays } from 'date-fns';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { SortBy } from '../common/utils/enums/sortBy.enum';
import { Status } from '../common/utils/enums/status.enum';
import { Chapter } from '../chapters/entities/chapter.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Favorite } from '../favorites/entities/favorite.entity';
import { BookIdEvent } from '../common/utils/events/bookId.event';
import { events } from '../common/utils/constants/event.constant';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';
import { InterestedCategoriesService } from '../interested-categories/interested-categories.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private booksRepository: Repository<Book>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    @InjectRepository(Chapter) private chaptersRepository: Repository<Chapter>,
    private cloudinaryService: CloudinaryService,
    private categoriesService: CategoriesService,
    private eventEmitter: EventEmitter2,
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
    await this.checkDuplicateSlug(slug);

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
    //increase selected category's priority
    await this.categoriesService.increasePriority(category.categoryId);

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
    // if (paginatedBooks.items.length === 0) {
    //   throw new NotFoundException('No books found');
    // }

    //jf user logged in check if the book is user's favorited book
    await this.setFavoriteManyBooks(paginatedBooks, user);

    return paginatedBooks;
  }

  //find popular books based by users' favorites
  async getPopularBooks(
    user: User,
    options: IPaginationOptions,
  ): Promise<Pagination<Book>> {
    const qb = this.publishedBooksWithUserAndCategory().orderBy(
      'books.favoriteCount',
      'DESC',
    );

    const paginatedBooks = await paginate<Book>(qb, options);

    // if (paginatedBooks.items.length === 0) {
    //   throw new NotFoundException('No books found');
    // }

    //jf user logged in check if the book is user's favorited book
    await this.setFavoriteManyBooks(paginatedBooks, user);

    return paginatedBooks;
  }

  //find related books by current book slug
  async getRelatedBooks(
    slug: string,
    options: IPaginationOptions,
    user?: User,
  ): Promise<Pagination<Book>> {
    const { category, keywords, bookId } = await this.findOneWithSlug(slug);

    const qb = this.publishedBooksWithUserAndCategory();

    qb.andWhere(
      new Brackets((qb) => {
        qb.where('books.category_id = :categoryId', {
          categoryId: category.categoryId,
        }).orWhere(
          'EXISTS (SELECT 1 FROM unnest(books.keywords) keyword WHERE keyword IN (:...keywords))',
          { keywords },
        );
      }),
    );

    const paginatedBooks = await paginate<Book>(qb, options);

    //remove current book from related books
    const items = paginatedBooks.items;
    items.forEach((item) => {
      if (item.bookId === bookId) {
        items.splice(items.indexOf(item), 1);
        paginatedBooks.meta.totalItems--;
        paginatedBooks.meta.itemCount--;
      }
    });

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
      await this.searchBooks(search, qb);
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

    //jf user logged in check if the book is user's favorite book
    await this.setFavoriteManyBooks(paginatedBooks, user);

    return paginatedBooks;
  }

  async findOneWithSlug(slug: string, user?: User): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {
        slug,
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
    search: string,
    options: IPaginationOptions,
  ): Promise<Pagination<Book>> {
    const qb = this.booksRepository
      .createQueryBuilder('books')
      .leftJoinAndSelect(`books.user`, 'user')
      .leftJoinAndSelect(`books.category`, 'category')
      .andWhere('user.userId = :userId', { userId: user.userId });

    //search with title keywords and description
    if (search) {
      await this.searchBooks(search, qb);
    }

    //sort books
    this.sortBooks(sortBy, qb);

    const paginatedBooks = await paginate<Book>(qb, options);

    //check these books are user's favorite books or not
    await this.setFavoriteManyBooks(paginatedBooks, user);

    return paginatedBooks;
  }

  async findOneWithSlugByAuthor(user: User, slug: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {
        slug,
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
    bookSlug: string,
    newCoverImage: Express.Multer.File,
    updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    //find book
    const book = await this.findOneWithSlugByAuthor(user, bookSlug);

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

    //if user published the book, check if this book has publish chapters, if not can't publish the book
    if (updateBookDto?.status === Status.PUBLISHED) {
      const chapters = await this.chaptersRepository.find({
        where: {
          book: {
            slug: bookSlug,
          },
          status: Status.PUBLISHED,
        },
      });

      if (chapters.length === 0) {
        throw new BadRequestException(
          "This book has no published chapters, can't publish the book",
        );
      }
    } else {
      const { bookId } = book;
      //if user unpublished the book, then clear every history belong to this book.
      this.eventEmitter.emit(events.CLEAR_HISTORY, { bookId });
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

    //if user changed the category, update the category priority
    if (updateBookDto?.categoryId) {
      //descrease the priority of the old category
      await this.categoriesService.decreasePriority(book.category.categoryId);
      //increase the priority of the new category
      await this.categoriesService.increasePriority(category.categoryId);
    }

    return this.booksRepository.save(updatedBook);
  }

  async getAllSoftDeletedBooks(
    user: User,
    options: IPaginationOptions,
  ): Promise<Pagination<Book>> {
    const { userId } = user;
    //get all deleted books and check if the deleted date is expired, then hard delte those books
    const deletedBooks = await this.deletedBooks(userId).getMany();
    const checkedBooks = deletedBooks.map(async (book) => {
      const dayLeft = differenceInDays(book.deletedExpiredDate, new Date()) + 1;

      //if the deleted date is expired, hard delete the book
      if (dayLeft <= 0) {
        return this.remove(user, Array.of(book.slug));
      } else {
        //if the deleted date is not expired, update the deleted expired day left
        book.expireDayLeft = dayLeft;
        return this.booksRepository.save(book);
      }
    });
    await Promise.all(checkedBooks);

    //get all updated soft deleted books
    const qb = this.deletedBooks(userId);

    const paginatedBooks = await paginate<Book>(qb, options);
    // if (paginatedBooks.items.length === 0)
    //   throw new NotFoundException("You haven't deleted any books");

    return paginatedBooks;
  }

  async softDelete(user: User, bookSlug: string): Promise<Book> {
    const book = await this.findOneWithSlugByAuthor(user, bookSlug);

    const { bookId } = book;

    //set deleted expired date
    const deletedExpiredDate = this.softDeletedExpiredDate();
    book.deletedExpiredDate = deletedExpiredDate;

    //set deleted expired day
    const expireDayLeft = differenceInDays(
      deletedExpiredDate,
      new Date().toLocaleString(),
    );
    book.expireDayLeft = expireDayLeft;

    //unpublish the book
    book.status = Status.DRAFT;
    await this.booksRepository.save(book);

    //soft delete book
    await this.booksRepository.softDelete(bookId);

    //if user unpublished the book, then clear every history belong to this book.
    this.eventEmitter.emit(events.CLEAR_HISTORY, { bookId });

    return { ...book, expireDayLeft };
  }

  async restore(user: User, slugs: string[]): Promise<Book[]> {
    //check if all slugs actually exist
    const deletedBooks = await Promise.all(
      slugs.map(async (slug) => {
        const book = await this.getOneSoftDeletedBook(user, slug);

        if (!book)
          throw new NotFoundException(
            `Book not found with this slug: ${slug}. Restoring process cancelled`,
          );
        return book;
      }),
    );

    //restore books
    const restoredBooks = await Promise.all(
      deletedBooks.map(async (book) => {
        // remove deletedExpired date and deletedExpiredIn
        book.deletedExpiredDate = null;
        book.expireDayLeft = null;
        await this.booksRepository.save(book);

        //restore book
        await this.booksRepository.restore(book.bookId);
        return book;
      }),
    );

    return restoredBooks;
  }

  async remove(user: User, slugs: string[]): Promise<Book[]> {
    //check if all slugs actually exist
    const softDeletedBooks = await Promise.all(
      slugs.map(async (slug) => {
        const book = await this.getOneSoftDeletedBook(user, slug);

        if (!book)
          throw new NotFoundException(
            `Book not found with this slug: ${slug}. Deleting process cancelled`,
          );
        return book;
      }),
    );

    const hardDeletedBooks = await Promise.all(
      softDeletedBooks.map(async (book) => {
        //delete image in cloudinary if there is an image
        book.coverImage &&
          (await this.cloudinaryService.deleteImage(book.coverImage));

        await this.booksRepository.delete(book.bookId);

        //decrease the priority of the category
        await this.categoriesService.decreasePriority(book.category.categoryId);

        return book;
      }),
    );

    return hardDeletedBooks;
  }

  //functions

  createSlug(title: string, userId: number): string {
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

  deletedBooks(userId: number): SelectQueryBuilder<Book> {
    return this.booksRepository
      .createQueryBuilder('books')
      .withDeleted()
      .leftJoinAndSelect(`books.user`, 'user')
      .leftJoinAndSelect(`books.category`, 'category')
      .where('user.userId =:userId', { userId })
      .andWhere('books.deleted_at IS NOT NULL ')
      .orderBy('books.expire_day_left', 'ASC');
  }

  async getOneSoftDeletedBook(user: User, slug: string): Promise<Book> {
    const deletedBook = await this.booksRepository
      .createQueryBuilder('books')
      .withDeleted()
      .leftJoinAndSelect(`books.user`, 'user')
      .leftJoinAndSelect(`books.category`, 'category')
      .where('user.userId =:userId', { userId: user.userId })
      .andWhere('books.slug =:slug', { slug })
      .andWhere('books.deleted_at IS NOT NULL ')
      .getOne();

    return deletedBook;
  }

  sortBooks(sortBy: SortBy, qb: SelectQueryBuilder<Book>) {
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

  async searchBooks(search: string, qb: SelectQueryBuilder<Book>) {
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

  async isFavorite(userId: number, slug: string): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        userId,
        book: { slug },
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
      for (const book of paginatedBooks?.items) {
        isFavorite = await this.isFavorite(user.userId, book.slug);
        book.isFavorite = isFavorite;
      }
    }
  }

  async setFavoriteOneBook(book: Book, user?: User) {
    let isFavorite: boolean = false;
    if (user) {
      isFavorite = await this.isFavorite(user.userId, book.slug);
      book.isFavorite = isFavorite;
    }
  }

  softDeletedExpiredDate() {
    const today = new Date();
    const expiredDate = addDays(today, 30);
    return expiredDate;
  }

  //events

  @OnEvent(events.FAVORITE_CREATED, { async: true })
  async increaseFavorite(payload: BookIdEvent) {
    const { bookId } = payload;
    const book = await this.booksRepository.findOne({ where: { bookId } });
    const favoriteCount = book.favoriteCount + 1;
    const increasedFavorite = this.booksRepository.create({
      ...book,
      favoriteCount,
    });
    await this.booksRepository.save(increasedFavorite);
  }

  @OnEvent(events.FAVORITE_DELETED, { async: true })
  async decreaseFavorite(payload: BookIdEvent) {
    const { bookId } = payload;
    const book = await this.booksRepository.findOne({ where: { bookId } });
    let favoriteCount = book.favoriteCount;
    if (favoriteCount > 0) {
      favoriteCount--;
    }
    const decreasedFavorite = this.booksRepository.create({
      ...book,
      favoriteCount,
    });
    await this.booksRepository.save(decreasedFavorite);
  }

  @OnEvent(events.BOOK_STATUS_CHANGED, { async: true })
  async unpublishBook(payload: BookIdEvent) {
    const { bookId } = payload;
    const book = await this.booksRepository.findOne({
      where: {
        bookId,
      },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.status === Status.DRAFT) {
      return;
    }
    book.status = Status.DRAFT;
    await this.booksRepository.save(book);
  }

  //cron

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async deleteExpiredBooks() {
  //   try {
  //     const today = new Date();
  //     // const result = await this.booksRepository.delete({
  //     //   deletedExpiredDate: LessThan(today),
  //     // });
  //     const result = await this.booksRepository
  //       .createQueryBuilder('books')
  //       .withDeleted()
  //       .leftJoinAndSelect(`books.user`, 'user')
  //       .leftJoinAndSelect(`books.category`, 'category')
  //       .andWhere('books.deleted_at IS NOT NULL ')
  //       .getMany();

  //     result.map(async (book) => {
  //       if (book.expireDayLeft <= 0) {
  //         //delete cover image from cloudinary
  //         book.coverImage &&
  //           (await this.cloudinaryService.deleteImage(book.coverImage));

  //         await this.booksRepository.delete(book.bookId);

  //         //decrease the priority of the category
  //         await this.categoriesService.decreasePriority(
  //           book.category.categoryId,
  //         );
  //       }
  //     });
  //     console.log(`books deleted`);
  //   } catch (error) {
  //     console.error('Error deleting expired deleted books:', error);
  //   }
  // }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async updateExpiredDayLeft() {
  //   try {
  //     const today = new Date();
  //     const deletedBooks = await this.booksRepository
  //       .createQueryBuilder('books')
  //       .withDeleted()
  //       .leftJoinAndSelect(`books.user`, 'user')
  //       .leftJoinAndSelect(`books.category`, 'category')
  //       .andWhere('books.deleted_at IS NOT NULL ')
  //       .getMany();

  //     deletedBooks.forEach(async (book) => {
  //       book.expireDayLeft = differenceInDays(book.deletedExpiredDate, today);
  //       await this.booksRepository.save(book);
  //     });
  //     Logger.log('Updated deletedExpiredIn for books');
  //   } catch (error) {
  //     console.error('Error while updating deletedExpiredIn :', error);
  //   }
  // }
}
