import { Module } from '@nestjs/common';
import { InterestedCategoriesService } from './interested-categories.service';
import { InterestedCategoriesController } from './interested-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestedCategory } from './entities/interested-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InterestedCategory])],
  controllers: [InterestedCategoriesController],
  providers: [InterestedCategoriesService],
})
export class InterestedCategoriesModule {}
