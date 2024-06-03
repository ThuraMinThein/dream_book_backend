import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { CategoriesModule } from './categories/categories.module';
import { ChaptersModule } from './chapters/chapters.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CommentsModule } from './comments/comments.module';
import { InterestedCategoriesModule } from './interested-categories/interested-categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import config from './typeorm/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { ChapterProgressModule } from './chapter-progress/chapter-progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(config),
    AuthModule,
    UsersModule,
    BooksModule,
    ChaptersModule,
    CommentsModule,
    FavoritesModule,
    CategoriesModule,
    ChapterProgressModule,
    InterestedCategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
