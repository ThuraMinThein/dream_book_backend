import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNumber()
  @IsOptional()
  parentCommentId: number;
}
