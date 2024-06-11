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
  IsIn,
} from 'class-validator';
import { Gender } from '../../utils/enums/gender.enum';
import { CountryCodeArray } from '../../utils/constants/countryCode';

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
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  bio: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;
}
