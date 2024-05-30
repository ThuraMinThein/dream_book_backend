import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateInterestedCategoryDto } from './dto/update-interested-category.dto';
import { User } from '../users/entities/user.entity';
import { InterestedCategory } from './entities/interested-category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CreateInterestedCategoryDto } from './dto/create-interested-category.dto';
import { use } from 'passport';

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
    const category = await this.categoriesService.findOne(
      createInterestedCategoryDto.categoryId,
    );
    const interestedCategory = this.interestedCategoriesRepository.create({
      user,
      category,
    });

    return this.interestedCategoriesRepository.save(interestedCategory);
  }

  async getAllInterestedCategoriesByUser(
    user: User,
  ): Promise<InterestedCategory[]> {
    const interestedCategory = await this.interestedCategoriesRepository.find({
      where: {
        userId: user.userId,
      },
    });
    return interestedCategory;
  }

  async findOneWithUserId(userId: number, id: number) {
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
