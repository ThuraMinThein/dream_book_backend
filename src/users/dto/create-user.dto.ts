import {
  IsEnum,
  IsEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { Gender } from '../../utils/enums/gender.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(25)
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  profilePicture: string;

  @IsEmpty({ message: 'Email is not allowed to change' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  bio: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;
}
