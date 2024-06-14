import {
  Get,
  Post,
  Body,
  Delete,
  Request,
  UseGuards,
  UseFilters,
  Controller,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  ParseIntPipe,
} from '@nestjs/common';
import { Favorite } from './entities/favorite.entity';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.gurad';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { GROUP_USER } from '../utils/serializers/group.serializer';
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
    return this.favoritesService.create(req.user, createFavoriteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async getAllFavoriteByUser(
    @Request() req: CustomRequest,
  ): Promise<Favorite[]> {
    return this.favoritesService.getAllFavoriteByUser(req.user);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async delete(
    @Request() req: CustomRequest,
    @Body('bookId', ParseIntPipe) bookId: any,
  ): Promise<any> {
    return this.favoritesService.delete(req.user, bookId);
  }
}
