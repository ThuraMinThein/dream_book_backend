import {
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  UseFilters,
  Controller,
  ParseIntPipe,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { GROUP_USER } from '../utils/serializers/group.serializer';
import { InterestedCategory } from './entities/interested-category.entity';
import { InterestedCategoriesService } from './interested-categories.service';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { CreateInterestedCategoryDto } from './dto/create-interested-category.dto';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'interested-categories',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class InterestedCategoriesController {
  constructor(
    private readonly interestedCategoriesService: InterestedCategoriesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async create(
    @Request() req: CustomRequest,
    @Body() createInterestedCategoryDto: CreateInterestedCategoryDto,
  ): Promise<InterestedCategory[]> {
    try {
      return this.interestedCategoriesService.create(
        req.user,
        createInterestedCategoryDto,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while creating interested category',
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async getInterestedCategoriesByUser(
    @Request() req: CustomRequest,
  ): Promise<InterestedCategory[]> {
    try {
      return this.interestedCategoriesService.getInterestedCategoriesByUser(
        req.user,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching interested categories',
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async delete(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) id: any,
  ): Promise<InterestedCategory> {
    try {
      return this.interestedCategoriesService.delete(req.user, id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while deleting interested category',
      );
    }
  }
}
