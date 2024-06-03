import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CategoriesService } from '../categories/categories.service';
import { InterestedCategory } from './entities/interested-category.entity';
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
  ): Promise<InterestedCategory[]> {
    const categories = createInterestedCategoryDto.categoryIds;

    for (let i = 0; i < categories.length; i++) {
      //check if category exists
      const category = await this.categoriesService.findOne(categories[i]);

      //check for duplicate user category
      await this.isDuplicateUserCategory(user.userId, categories[i]);

      //create interestedCategory
      const interestedCategory = this.interestedCategoriesRepository.create({
        user,
        category,
      });
      await this.interestedCategoriesRepository.save(interestedCategory);
    }

    const returnData = await this.getInterestedCategoriesByUser(user);

    return returnData;
  }

  async getInterestedCategoriesByUser(
    user: User,
  ): Promise<InterestedCategory[]> {
    if (!user) return [];
    const interestedCategory = await this.interestedCategoriesRepository.find({
      where: {
        userId: user.userId,
      },
      relations: {
        user: true,
        category: true,
      },
    });
    return interestedCategory;
  }

  async isDuplicateUserCategory(userId: number, categoryId: number) {
    const interestedCategory =
      await this.interestedCategoriesRepository.findOne({
        where: {
          userId,
          categoryId,
        },
      });
    if (interestedCategory)
      throw new ConflictException('Duplicate user category');
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
