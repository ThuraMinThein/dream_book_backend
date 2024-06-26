import { ModeEnum } from '../common/utils/enums/mode.enum';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Category } from '../categories/entities/category.entity';
import { History } from '../book-history/entities/history.entity';
import { Progress } from '../chapter-progress/entities/chapter-progress.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { InterestedCategory } from '../interested-categories/entities/interested-category.entity';

const sslReject =
  process.env.MODE === ModeEnum.Production
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : null;

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Book,
    Chapter,
    Comment,
    History,
    Category,
    Favorite,
    Progress,
    InterestedCategory,
  ],
  ...sslReject,
  synchronize: false,
};

export default config;
