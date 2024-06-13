import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { BooksService } from '../books/books.service';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    private booksService: BooksService,
  ) {}

  //services
  async create(
    user: User,
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<Favorite> {
    const { bookId } = createFavoriteDto;
    //check if book exists
    const book = await this.booksService.findOne(bookId);

    //check if the user already set the book to favorite
    const isUserSetFavorite = await this.findOneWithUserIdAndBookId(
      user.userId,
      bookId,
    );
    if (isUserSetFavorite) return;
    //plus one favorite in book
    await this.booksService.increaseFavorite(bookId);

    const favorite = this.favoritesRepository.create({
      user,
      book,
    });
    return this.favoritesRepository.save(favorite);
  }

  async getAllFavoriteByUser(user: User): Promise<Favorite[]> {
    const favorites = await this.favoritesRepository.find({
      where: {
        userId: user.userId,
      },
      relations: {
        user: true,
        book: {
          user: true,
          category: true,
        },
      },
    });
    if (favorites.length === 0)
      throw new NotFoundException("You don't have any favorite books yet");
    return favorites;
  }

  async findOneWithUserIdAndBookId(userId: number, bookId: number) {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        userId,
        bookId,
      },
      relations: {
        user: true,
        book: true,
      },
    });
    return favorite;
  }

  async delete(user: User, bookId: number): Promise<any> {
    const { userId } = user;
    const favorite = await this.findOneWithUserIdAndBookId(userId, bookId);
    if (!favorite) throw new NotFoundException('not found to delete');
    //minus one favorite in book
    await this.booksService.decreaseFavorite(bookId);
    await this.favoritesRepository.delete({
      userId,
      bookId,
    });

    return favorite;
  }
}
