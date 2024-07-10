import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { User } from '../users/entities/user.entity';
import { BooksService } from '../books/books.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { events } from '../common/utils/constants/event.constant';
import { BookIdEvent } from '../common/utils/events/bookId.event';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History) private historyRepository: Repository<History>,
    private bookService: BooksService,
  ) {}

  async create(
    user: User,
    createHistoryDto: CreateHistoryDto,
  ): Promise<History> {
    //check if the book exists or not
    const { bookSlug } = createHistoryDto;

    const book = await this.bookService.findOneWithSlug(bookSlug);

    const newHistory = this.historyRepository.create({ user, book });

    //check if the book history and chante update date
    const hasHistory = await this.getOneHistory(user.userId, book.slug);
    if (hasHistory) {
      newHistory.updatedAt = new Date();
    }
    await this.historyRepository.save(newHistory);

    //check if the total number of history is greater than 10, then delete the oldest history
    const totalHistory = await this.getAllHistory(user);
    const lastIndex = totalHistory.length - 1;

    if (totalHistory.length > 12) {
      const { userId } = user;
      const { bookId } = totalHistory[lastIndex];

      await this.historyRepository.delete({ userId, bookId });
    }

    return newHistory;
  }

  async getAllHistory(user: User): Promise<History[]> {
    const { userId } = user;
    const history = await this.historyRepository.find({
      where: {
        userId,
      },
      relations: {
        user: true,
        book: {
          category: true,
        },
      },
      order: {
        updatedAt: 'DESC',
      },
    });
    return history;
  }

  async getOneHistory(userId: number, slug: string): Promise<History> {
    const history = await this.historyRepository.findOne({
      where: {
        userId,
        book: {
          slug,
        },
      },
    });
    return history;
  }

  async delete(user: User, slug: string): Promise<History> {
    const { userId } = user;
    const history = await this.getOneHistory(userId, slug);
    if (!history) throw new NotFoundException('History not found');

    const { bookId } = history;

    await this.historyRepository.delete({
      userId,
      bookId,
    });

    return history;
  }

  //events
  @OnEvent(events.CLEAR_HISTORY, { async: true })
  async clearHistory(payload: BookIdEvent) {
    const { bookId } = payload;
    const histories = await this.historyRepository.find({ where: { bookId } });
    await this.historyRepository.remove(histories);
  }
}
