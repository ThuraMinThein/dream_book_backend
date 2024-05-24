import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDtos {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  password: string;
}
