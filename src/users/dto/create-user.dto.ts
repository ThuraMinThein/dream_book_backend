import {
  IsEnum,
  IsEmail,
  Matches,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { Gender } from '../../utils/enums/gender.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  profilePicture: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+\d{1,3}$/, { message: 'Invalid country code' })
  countryCode: string;

  @IsString()
  @IsOptional()
  @MaxLength(15, { message: 'Invalid number' })
  @MinLength(7, { message: 'Invalid number' })
  @Matches(/^\d+$/, { message: 'Invalid number' })
  localNumber: string;

  @IsOptional()
  bio: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;
}
