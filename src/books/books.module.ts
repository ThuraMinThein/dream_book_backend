import { Module } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BooksController } from './books.controller';
import { CategoriesModule } from '../categories/categories.module';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';
import { ParseNumberArrayPipe } from '../common/pipes/parseNumberArrayPipe.pipe';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), UsersModule, CategoriesModule],
  controllers: [BooksController],
  providers: [BooksService, CloudinaryService, ParseNumberArrayPipe],
  exports: [BooksService],
})
export class BooksModule {}
