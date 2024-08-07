import {
  Get,
  Post,
  Body,
  Query,
  Delete,
  Request,
  UseGuards,
  UseFilters,
  Controller,
  ParseIntPipe,
  UseInterceptors,
  SerializeOptions,
  DefaultValuePipe,
  ClassSerializerInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { History } from './entities/history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { GROUP_USER } from '../common/utils/serializers/group.serializer';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'history',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async create(
    @Request() req: CustomRequest,
    @Body() createHistoryDto: CreateHistoryDto,
  ): Promise<History> {
    try {
      return this.historyService.create(req.user, createHistoryDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while creating history');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async getAllHistory(@Request() req: CustomRequest): Promise<History[]> {
    try {
      return this.historyService.getAllHistory(req.user);
    } catch (error) {
      throw new InternalServerErrorException('Error while fetching histories');
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async delete(
    @Request() req: CustomRequest,
    @Query('slug') slug: string,
  ): Promise<any> {
    try {
      return this.historyService.delete(req.user, slug);
    } catch (error) {
      throw new InternalServerErrorException('Error while deleting history');
    }
  }
}
