import { PartialType } from '@nestjs/mapped-types';
import { CreateChapterProgressDto } from './create-chapter-progress.dto';

export class UpdateChapterProgressDto extends PartialType(CreateChapterProgressDto) {}
