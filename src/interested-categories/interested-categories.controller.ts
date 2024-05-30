import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Request,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { InterestedCategoriesService } from './interested-categories.service';
import { CreateInterestedCategoryDto } from './dto/create-interested-category.dto';
import { UpdateInterestedCategoryDto } from './dto/update-interested-category.dto';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.gurad';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { GROUP_USER } from '../utils/serializers/group.serializer';
import { InterestedCategory } from './entities/interested-category.entity';

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
  ) {
    return this.interestedCategoriesService.create(
      req.user,
      createInterestedCategoryDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async getAllInterestedCategoriesByUser(
    @Request() req: CustomRequest,
  ): Promise<InterestedCategory[]> {
    return this.interestedCategoriesService.getAllInterestedCategoriesByUser(
      req.user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  // @UseInterceptors(ClassSerializerInterceptor)
  // @SerializeOptions({groups: [GROUP_USER]})
  async delete(
    @Request() req: CustomRequest,
    @Param('id') id: string,
  ): Promise<InterestedCategory> {
    return this.interestedCategoriesService.delete(req.user, +id);
  }
}
