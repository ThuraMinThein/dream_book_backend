import { PartialType } from '@nestjs/mapped-types';
import { CreateInterestedCategoryDto } from './create-interested-category.dto';

export class UpdateInterestedCategoryDto extends PartialType(CreateInterestedCategoryDto) {}
