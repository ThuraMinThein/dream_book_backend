import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChapterProgressDto {
  @IsNumber()
  @IsNotEmpty()
  progress: number;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsNumber()
  @IsNotEmpty()
  chapterId: number;
}
