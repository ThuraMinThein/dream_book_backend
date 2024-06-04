import { Module, forwardRef } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BooksController } from './books.controller';
import { Favorite } from '../favorites/entities/favorite.entity';
import { CategoriesModule } from '../categories/categories.module';
import { ParseNumberArrayPipe } from '../common/pipes/parseNumberArrayPipe.pipe';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';
import { InterestedCategoriesModule } from '../interested-categories/interested-categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Favorite]),
    UsersModule,
    CategoriesModule,
    InterestedCategoriesModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, CloudinaryService, ParseNumberArrayPipe],
  exports: [BooksService],
})
export class BooksModule {}
