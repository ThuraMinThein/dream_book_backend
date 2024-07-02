import { Test, TestingModule } from '@nestjs/testing';
import { ReplyCommentsService } from './reply-comments.service';

describe('ReplyCommentsService', () => {
  let service: ReplyCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReplyCommentsService],
    }).compile();

    service = module.get<ReplyCommentsService>(ReplyCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
