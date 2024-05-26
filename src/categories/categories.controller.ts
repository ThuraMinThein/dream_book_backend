import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TypeormExceptionFilter } from 'src/common/filters/exceptionfilters/typeorm-exception.filter';
import { Category } from './entities/category.entity';
import { FileInterceptor } from '@nestjs/platform-express';

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
    return this.categoriesService.create(icon, createCategoryDto);
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<Category> {
  //   return this.categoriesService.findOne(+id);
  // }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id') categoryId: string,
    @UploadedFile() icon: Express.Multer.File,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(+categoryId, icon, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') categoryId: string): Promise<Category> {
    return this.categoriesService.remove(+categoryId);
  }
}
