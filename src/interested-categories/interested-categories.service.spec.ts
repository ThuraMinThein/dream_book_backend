import { Test, TestingModule } from '@nestjs/testing';
import { InterestedCategoriesService } from './interested-categories.service';

describe('InterestedCategoriesService', () => {
  let service: InterestedCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterestedCategoriesService],
    }).compile();

    service = module.get<InterestedCategoriesService>(InterestedCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
