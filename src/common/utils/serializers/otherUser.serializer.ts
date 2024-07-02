import { Exclude } from 'class-transformer';
import { Gender } from '../enums/gender.enum';

export class OtherUserSerializer {
  userId: number;
  name: string;
  profilePicture: string;
  gender: Gender;
  createdAt: Date;

  @Exclude()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  phoneNumber: string;

  @Exclude()
  bio: string;

  constructor(partial: Partial<OtherUserSerializer>) {
    Object.assign(this, partial);
  }
}
