import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { InterestedCategory } from './entities/interested-category.entity';
import { InterestedCategoriesService } from './interested-categories.service';
import { InterestedCategoriesController } from './interested-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InterestedCategory]), CategoriesModule],
  controllers: [InterestedCategoriesController],
  providers: [InterestedCategoriesService],
  exports: [InterestedCategoriesService],
})
export class InterestedCategoriesModule {}
