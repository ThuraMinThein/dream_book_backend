import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TypeormExceptionFilter } from 'src/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'categories',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
}
