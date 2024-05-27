import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Status } from 'src/utils/enums/status.enum';

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
  @IsNotEmpty()
  keywords: string[];

  @IsEnum(Status)
  status: Status;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ obj, key }) => parseInt(obj[key]))
  categoryId: number;
}
