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
import { InterestedCategoriesService } from './interested-categories.service';
import { CreateInterestedCategoryDto } from './dto/create-interested-category.dto';
import { UpdateInterestedCategoryDto } from './dto/update-interested-category.dto';
import { TypeormExceptionFilter } from 'src/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'interested-categories',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class InterestedCategoriesController {
  constructor(
    private readonly interestedCategoriesService: InterestedCategoriesService,
  ) {}
}
