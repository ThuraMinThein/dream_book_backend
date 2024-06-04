import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private cloudinaryService: CloudinaryService,
  ) {}

  //services

  async create(
    icon: Express.Multer.File,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    //check the title exists
    const category = await this.findOneWithTitle(createCategoryDto.title);
    if (category) throw new ConflictException('Duplicate category');

    //store icon in cloudinary
    let iconUrl: string;
    if (icon) {
      const { url } = await this.cloudinaryService.storeImage(
        icon,
        'category-icons',
      );
      iconUrl = url;
    }

    //create category
    const newCategory = this.categoriesRepository.create({
      ...createCategoryDto,
      icon: iconUrl,
    });
    return this.categoriesRepository.save(newCategory);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoriesRepository.find({
      order: {
        priority: 'DESC',
      },
    });
    if (categories.length === 0) {
      throw new NotFoundException('No categories found');
    }
    return categories;
  }

  async findOne(categoryId: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: {
        categoryId,
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    categoryId: number,
    newIcon: Express.Multer.File,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(categoryId);

    //if the user wants to change the icon, replace image in cloudinary with new and old icon
    let icon = category.icon;
    if (newIcon) {
      const { url } = await this.cloudinaryService.storeImage(
        newIcon,
        'category-icons',
      );
      icon = url;

      //delete old image in cloudinary if there is an image exists.
      category?.icon &&
        (await this.cloudinaryService.deleteImage(category.icon));
    }

    const updatedCategory = this.categoriesRepository.create({
      ...category,
      icon,
      ...updateCategoryDto,
    });
    return this.categoriesRepository.save(updatedCategory);
  }

  async remove(categoryId: number): Promise<Category> {
    const category = await this.findOne(categoryId);

    //delete category in cloudinary if there is an image exists.
    category?.icon && (await this.cloudinaryService.deleteImage(category.icon));

    await this.categoriesRepository.delete(categoryId);
    return category;
  }

  //functions

  async findOneWithTitle(title: string): Promise<Category> {
    return this.categoriesRepository.findOneBy({ title });
  }
}
