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
  InternalServerErrorException,
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
    try {
      return this.categoriesService.create(icon, createCategoryDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while creating category');
    }
  }

  @Get()
  async findAll(): Promise<Category[]> {
    try {
      return this.categoriesService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Error while fetching categories');
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id', ParseIntPipe) categoryId: any,
    @UploadedFile() icon: Express.Multer.File,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      return this.categoriesService.update(categoryId, icon, updateCategoryDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while updating category');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) categoryId: any): Promise<Category> {
    try {
      return this.categoriesService.remove(categoryId);
    } catch (error) {
      throw new InternalServerErrorException('Error while deleting category');
    }
  }
}
