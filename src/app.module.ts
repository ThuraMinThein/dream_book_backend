import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import config from './typeorm/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChaptersModule } from './chapters/chapters.module';
import { CommentsModule } from './comments/comments.module';
import { HistoryModule } from './book-history/history.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CategoriesModule } from './categories/categories.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ChapterProgressModule } from './chapter-progress/chapter-progress.module';
import { InterestedCategoriesModule } from './interested-categories/interested-categories.module';
import { ReplyCommentsModule } from './reply-comments/reply-comments.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRoot(config),
    AuthModule,
    UsersModule,
    BooksModule,
    HistoryModule,
    ChaptersModule,
    CommentsModule,
    FavoritesModule,
    CategoriesModule,
    ReplyCommentsModule,
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
