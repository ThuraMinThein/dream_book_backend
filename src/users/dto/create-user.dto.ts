import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/utils/enums/gender.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  profilePicture: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(7)
  password: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  bio: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;
}
