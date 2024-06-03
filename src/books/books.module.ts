import { Module } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BooksController } from './books.controller';
import { CategoriesModule } from '../categories/categories.module';
import { ParseNumberArrayPipe } from '../common/pipes/parseNumberArrayPipe.pipe';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';
import { InterestedCategoriesModule } from '../interested-categories/interested-categories.module';
import { InterestedCategoriesService } from '../interested-categories/interested-categories.service';
import { InterestedCategory } from '../interested-categories/entities/interested-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    UsersModule,
    CategoriesModule,
    InterestedCategoriesModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, CloudinaryService, ParseNumberArrayPipe],
  exports: [BooksService],
})
export class BooksModule {}
