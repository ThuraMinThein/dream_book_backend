import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/Book.entity';
import { UsersModule } from 'src/users/users.module';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), UsersModule, CategoriesModule],
  controllers: [BooksController],
  providers: [BooksService, CloudinaryService],
  exports: [BooksService],
})
export class BooksModule {}
