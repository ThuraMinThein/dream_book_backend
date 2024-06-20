import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Status } from '../../common/utils/enums/status.enum';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsNumber()
  @IsOptional()
  priority: number;

  @IsEnum(Status)
  @IsOptional()
  status: Status;

  @IsString()
  @IsNotEmpty()
  slug: string;
}
