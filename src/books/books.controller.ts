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
  Req,
  SerializeOptions,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { TypeormExceptionFilter } from 'src/common/filters/exceptionfilters/typeorm-exception.filter';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.gurad';
import { Request } from 'express';
import { User } from 'src/users/entities/User.entity';
import { CustomRequest } from 'src/common/interfaces/custom-request.interface';
import { GROUP_USER } from 'src/utils/serializers/group.serializer';

@Controller({
  path: 'books',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  create(
    @Req() req: Request,
    @Body() createBookDto: CreateBookDto,
  ): Promise<any> {
    const user = req.user as User;
    return this.booksService.create(user, createBookDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  findAll(@Req() req: CustomRequest): Promise<any> {
    return this.booksService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  findOne(@Req() req: CustomRequest, @Param('id') id: string): Promise<any> {
    return this.booksService.findOne(req.user, +id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  update(
    @Req() req: CustomRequest,
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<any> {
    return this.booksService.update(req.user, +id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  remove(@Req() req: CustomRequest, @Param('id') id: string): Promise<any> {
    return this.booksService.remove(req.user, +id);
  }
}
