import { ArrayMinSize, ArrayUnique, IsArray, IsInt } from 'class-validator';

export class CreateInterestedCategoryDto {
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(3)
  @ArrayUnique()
  categoryIds: number[];
}
