import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { ModeEnum } from '../utils/enums/mode.enum';
import { User } from '../users/entities/User.entity';
import { Book } from '../books/entities/Book.entity';
import { Category } from '../categories/entities/category.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { InterestedCategory } from '../interested-categories/entities/interested-category.entity';
import { Progress } from '../chapter-progress/entities/chapter-progress.entity';

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
    Category,
    Chapter,
    Comment,
    Favorite,
    InterestedCategory,
    Progress,
  ],
  ...sslReject,
  synchronize: false,
};

export default config;
