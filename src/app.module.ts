import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import config from './typeorm/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { ChaptersModule } from './chapters/chapters.module';
import { CommentsModule } from './comments/comments.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CategoriesModule } from './categories/categories.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ChapterProgressModule } from './chapter-progress/chapter-progress.module';
import { InterestedCategoriesModule } from './interested-categories/interested-categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
