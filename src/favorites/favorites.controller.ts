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
import { Favorite } from './entities/favorite.entity';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { GROUP_USER } from '../common/utils/serializers/group.serializer';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'favorites',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async create(
    @Request() req: CustomRequest,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ): Promise<Favorite> {
    try {
      return this.favoritesService.create(req.user, createFavoriteDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while creating favorite');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async getAllFavoriteByUser(
    @Request() req: CustomRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ): Promise<Pagination<Favorite>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    try {
      return this.favoritesService.getAllFavoriteByUser(req.user, options);
    } catch (error) {
      throw new InternalServerErrorException('Error while fetching favorites');
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async delete(
    @Request() req: CustomRequest,
    @Body('slug') slug: string,
  ): Promise<any> {
    try {
      return this.favoritesService.delete(req.user, slug);
    } catch (error) {
      throw new InternalServerErrorException('Error while deleting favorite');
    }
  }
}
