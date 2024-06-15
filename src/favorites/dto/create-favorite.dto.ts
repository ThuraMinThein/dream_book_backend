import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  @IsNotEmpty()
  slug: string;
}
