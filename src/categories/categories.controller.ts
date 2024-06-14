import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  Controller,
  UploadedFile,
  ParseIntPipe,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'categories',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  async create(
    @UploadedFile() icon: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    if (!icon) throw new BadRequestException('Icon is required!');
    return this.categoriesService.create(icon, createCategoryDto);
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id', ParseIntPipe) categoryId: any,
    @UploadedFile() icon: Express.Multer.File,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(categoryId, icon, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) categoryId: any): Promise<Category> {
    return this.categoriesService.remove(categoryId);
  }
}
