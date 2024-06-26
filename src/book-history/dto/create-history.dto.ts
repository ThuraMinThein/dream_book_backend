import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  @IsNotEmpty()
  bookSlug: string;
}
