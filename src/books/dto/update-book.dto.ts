import { IsEnum, IsOptional } from 'class-validator';
import { CreateBookDto } from './create-book.dto';
import { PartialType } from '@nestjs/mapped-types';
import { Status } from '../../utils/enums/status.enum';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsEnum(Status)
  @IsOptional()
  status: Status;
}
