import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { TypeormExceptionFilter } from 'src/common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'favorites',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}
}
