import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Status } from 'src/utils/enums/status.enum';

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
  status: Status;
}
