import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateInterestedCategoryDto } from './dto/update-interested-category.dto';
import { User } from '../users/entities/user.entity';
import { InterestedCategory } from './entities/interested-category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CreateInterestedCategoryDto } from './dto/create-interested-category.dto';

@Injectable()
export class InterestedCategoriesService {
  constructor(
    @InjectRepository(InterestedCategory)
    private interestedCategoriesRepository: Repository<InterestedCategory>,
    private categoriesService: CategoriesService,
  ) {}

  async create(
    user: User,
    createInterestedCategoryDto: CreateInterestedCategoryDto,
  ): Promise<InterestedCategory> {
    //check if the user already create one
    const hasUser = await this.isUserExists(user.userId);
    if (hasUser) throw new ConflictException('Duplicate User');

    //check if category exists
    const categories = createInterestedCategoryDto.categoryIds;
    const allCategories = await Promise.all(
      categories.map(async (categoryId) => {
        const category = await this.categoriesService.findOne(categoryId);
        return category;
      }),
    );
    //create interestedCategory
    const interestedCategory = this.interestedCategoriesRepository.create({
      user,
      categoryIds: allCategories.map((category) => category.categoryId),
      categories: allCategories,
    });

    return this.interestedCategoriesRepository.save(interestedCategory);
  }

  async getInterestedCategoriesByUser(user: User): Promise<InterestedCategory> {
    const interestedCategory =
      await this.interestedCategoriesRepository.findOne({
        where: {
          userId: user.userId,
        },
        relations: {
          user: true,
          categories: true,
        },
      });
    if (!interestedCategory)
      throw new NotFoundException('No interestedCategory found');
    return interestedCategory;
  }

  async isUserExists(userId: number): Promise<InterestedCategory> {
    const interestedCategory =
      await this.interestedCategoriesRepository.findOne({
        where: {
          userId,
        },
      });
    return interestedCategory;
  }

  async findOneWithUserId(
    userId: number,
    id: number,
  ): Promise<InterestedCategory> {
    const interestedCategory =
      await this.interestedCategoriesRepository.findOne({
        where: {
          id,
          user: {
            userId,
          },
        },
      });
    if (!interestedCategory)
      throw new NotFoundException('interestedCategory not found');
    return interestedCategory;
  }

  async delete(user: User, id: number): Promise<InterestedCategory> {
    const interestedCategory = await this.findOneWithUserId(user.userId, id);
    await this.interestedCategoriesRepository.delete(id);
    return interestedCategory;
  }
}
