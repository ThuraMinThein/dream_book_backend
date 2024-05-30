import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestedCategory } from './entities/interested-category.entity';
import { InterestedCategoriesService } from './interested-categories.service';
import { InterestedCategoriesController } from './interested-categories.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([InterestedCategory]), CategoriesModule],
  controllers: [InterestedCategoriesController],
  providers: [InterestedCategoriesService],
})
export class InterestedCategoriesModule {}
