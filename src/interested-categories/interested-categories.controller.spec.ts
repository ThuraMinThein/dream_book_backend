import { Test, TestingModule } from '@nestjs/testing';
import { InterestedCategoriesController } from './interested-categories.controller';
import { InterestedCategoriesService } from './interested-categories.service';

describe('InterestedCategoriesController', () => {
  let controller: InterestedCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterestedCategoriesController],
      providers: [InterestedCategoriesService],
    }).compile();

    controller = module.get<InterestedCategoriesController>(InterestedCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
