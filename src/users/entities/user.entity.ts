import {
  Column,
  Entity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Gender } from '../../common/utils/enums/gender.enum';
import { Book } from '../../books/entities/book.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { GROUP_ADMIN } from '../../common/utils/serializers/group.serializer';
import { Progress } from '../../chapter-progress/entities/chapter-progress.entity';
import { InterestedCategory } from '../../interested-categories/entities/interested-category.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
    length: 255,
  })
  name: string;

  @Column({
    name: 'profile_picture',
    nullable: true,
    default: null,
    type: 'varchar',
    length: 255,
  })
  profilePicture: string;

  @Column({
    unique: true,
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  @Expose({ groups: [GROUP_ADMIN] })
  password: string;

  @Column({
    nullable: true,
    default: null,
    name: 'country_code',
  })
  countryCode: string;

  @Column({
    nullable: true,
    default: null,
    name: 'local_number',
  })
  localNumber: string;

  @Column({
    name: 'phone_number',
    nullable: true,
    default: null,
    type: 'varchar',
    unique: true,
  })
  phoneNumber: string;

  @Column({ nullable: true, default: null, type: 'text' })
  bio: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.RATHERNOTSAY,
  })
  gender: Gender;

  @CreateDateColumn({ name: 'created_at' })
  cratedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //relationships
  //a user can create many books
  @OneToMany(() => Book, (book) => book.user)
  books: Book[];

  //a user can have many categories
  @OneToMany(
    () => InterestedCategory,
    (interestedCategory) => interestedCategory.userId,
  )
  interestedCategories: InterestedCategory[];

  //a user can have man favorite books
  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  //a user can have many comments
  @OneToMany(() => Comment, (comments) => comments.user)
  comments: Comment[];

  //a user can have many chapter progresses
  @OneToMany(() => Progress, (progresses) => progresses.user)
  progresses: Progress[];
}
