import {
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Status } from '../../utils/enums/status.enum';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  coverImage: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  keywords: string[];

  @IsEnum(Status)
  status: Status;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ obj, key }) => parseInt(obj[key]))
  categoryId: number;
}
