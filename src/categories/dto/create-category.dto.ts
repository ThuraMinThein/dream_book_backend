import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  icon: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ obj, key }) => parseInt(obj[key]))
  priority: number;
}
