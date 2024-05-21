import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  keywords: string[];

  @IsEnum(Status)
  status: Status;
}
