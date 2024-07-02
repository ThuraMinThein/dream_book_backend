import { Test, TestingModule } from '@nestjs/testing';
import { ReplyCommentsController } from './reply-comments.controller';
import { ReplyCommentsService } from './reply-comments.service';

describe('ReplyCommentsController', () => {
  let controller: ReplyCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReplyCommentsController],
      providers: [ReplyCommentsService],
    }).compile();

    controller = module.get<ReplyCommentsController>(ReplyCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
