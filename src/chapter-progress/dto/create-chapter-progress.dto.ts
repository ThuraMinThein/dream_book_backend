import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChapterProgressDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsNumber()
  @IsNotEmpty()
  chapterId: number;
}
