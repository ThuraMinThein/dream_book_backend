import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from '../../books/entities/Book.entity';
import { Expose } from 'class-transformer';
import { GROUP_ADMIN } from 'src/utils/serializers/group.serializer';
import { Gender } from 'src/utils/enums/gender.enum';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { InterestedCategory } from 'src/interested-categories/entities/interested-category.entity';

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
    name: 'phone_number',
    nullable: true,
    default: null,
    type: 'varchar',
    length: 20,
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
  createdBooks: Book[];

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
  @OneToMany(() => Comment, (comments) => comments.userId)
  comments: Comment[];
}
