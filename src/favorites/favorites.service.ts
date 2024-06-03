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

  async create(
    user: User,
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<Favorite> {
    //check if book exists
    const book = await this.booksService.findOne(createFavoriteDto.bookId);

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
      //   relations: {
      //     user: true,
      //     book: true,
      //   },
    });
    if (favorites.length === 0)
      throw new NotFoundException("This user doesn't have any favorite book");
    return favorites;
  }

  async findOneWithUserId(userId: number, id: number) {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        userId,
        bookId: id,
      },
    });
    return favorite;
  }

  async delete(user: User, bookId: number): Promise<any> {
    const { userId } = user;
    const favorite = await this.findOneWithUserId(userId, bookId);
    if (!favorite) throw new NotFoundException('favorite not to delete');
    await this.favoritesRepository.delete({
      userId,
      bookId,
    });

    return favorite;
  }
}
