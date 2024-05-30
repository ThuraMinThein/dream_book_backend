import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChapterProgressDto {
  @IsNumber()
  @IsNotEmpty()
  progress: number;

  @IsNumber()
  @IsNotEmpty()
  bookId: number;

  @IsNumber()
  @IsNotEmpty()
  chapterId: number;
}
