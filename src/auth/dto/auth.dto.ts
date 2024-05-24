import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDtos {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
