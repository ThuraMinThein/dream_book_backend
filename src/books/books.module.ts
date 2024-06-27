import { Module } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BooksController } from './books.controller';
import { Chapter } from '../chapters/entities/chapter.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { CategoriesModule } from '../categories/categories.module';
import { ParseNumberArrayPipe } from '../common/pipes/parseNumberArray.pipe';
import { ParseStringArrayPipe } from '../common/pipes/parseStringArray.pipe';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';
import { InterestedCategoriesModule } from '../interested-categories/interested-categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Favorite, Chapter]),
    UsersModule,
    CategoriesModule,
    InterestedCategoriesModule,
  ],
  controllers: [BooksController],
  providers: [
    BooksService,
    CloudinaryService,
    ParseNumberArrayPipe,
    ParseStringArrayPipe,
  ],
  exports: [BooksService],
})
export class BooksModule {}
