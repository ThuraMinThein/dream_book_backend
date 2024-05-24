import { Book } from 'src/books/entities/Book.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Chapter } from 'src/chapters/entities/chapter.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { User } from 'src/users/entities/User.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { InterestedCategory } from 'src/interested-categories/entities/interested-category.entity';

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // entities: [__dirname + '/**/*.entity{.ts,.js}'],
  entities: [
    User,
    Book,
    Category,
    Chapter,
    Comment,
    Favorite,
    InterestedCategory,
  ],
  synchronize: false,
};

export default config;
