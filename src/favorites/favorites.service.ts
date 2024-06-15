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
    const { slug } = createFavoriteDto;
    //check if book exists
    const book = await this.booksService.findOneWithSlug(slug);

    //check if the user already set the book to favorite
    const isUserSetFavorite = await this.findOneWithUserIdAndBookId(
      user.userId,
      slug,
    );
    if (isUserSetFavorite) return;

    const favorite = this.favoritesRepository.create({
      user,
      book,
    });
    //plus one favorite in book
    await this.booksService.increaseFavorite(slug);
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

  async findOneWithUserIdAndBookId(userId: number, slug: string) {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        userId,
        book: { slug },
      },
      relations: {
        user: true,
        book: true,
      },
    });
    return favorite;
  }

  async delete(user: User, slug: string): Promise<any> {
    const { userId } = user;

    //find book with slug and get bookId
    const bookId = (await this.booksService.findOneWithSlug(slug)).bookId;

    const favorite = await this.findOneWithUserIdAndBookId(userId, slug);
    if (!favorite) throw new NotFoundException('Favorite not found to delete');
    await this.favoritesRepository.delete({
      userId,
      bookId,
    });
    //minus one favorite in book
    await this.booksService.decreaseFavorite(slug);

    return favorite;
  }
}
