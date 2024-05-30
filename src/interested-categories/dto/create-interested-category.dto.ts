import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateInterestedCategoryDto {
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
