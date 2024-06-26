import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateChapterProgressDto {
  @IsNumber()
  @IsNotEmpty()
  chapterId: number;
}
