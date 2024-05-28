import { Module } from '@nestjs/common';
import { Book } from './entities/Book.entity';
import { BooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BooksController } from './books.controller';
import { CategoriesModule } from '../categories/categories.module';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), UsersModule, CategoriesModule],
  controllers: [BooksController],
  providers: [BooksService, CloudinaryService],
  exports: [BooksService],
})
export class BooksModule {}
