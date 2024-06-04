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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.gurad';
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
    return this.interestedCategoriesService.create(
      req.user,
      createInterestedCategoryDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async getInterestedCategoriesByUser(
    @Request() req: CustomRequest,
  ): Promise<InterestedCategory[]> {
    return this.interestedCategoriesService.getInterestedCategoriesByUser(
      req.user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async delete(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InterestedCategory> {
    return this.interestedCategoriesService.delete(req.user, id);
  }
}
