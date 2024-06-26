import { Exclude } from 'class-transformer';
import { Gender } from '../enums/gender.enum';

export class UserSerializer {
  userId: number;
  name: string;
  profilePicture: string;
  email: string;

  @Exclude()
  password: string;

  phoneNumber: string;
  bio: string;
  gender: Gender;
  expiredDate: Date;
  access_token: string;

  constructor(partial: Partial<UserSerializer>) {
    Object.assign(this, partial);
  }
}
