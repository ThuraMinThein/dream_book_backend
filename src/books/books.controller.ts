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
  UploadedFile,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { TypeormExceptionFilter } from 'src/common/filters/exceptionfilters/typeorm-exception.filter';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.gurad';
import { User } from 'src/users/entities/User.entity';
import { CustomRequest } from 'src/common/interfaces/custom-request.interface';
import { GROUP_USER } from 'src/utils/serializers/group.serializer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Book } from './entities/Book.entity';

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
  @UseInterceptors(FileInterceptor('coverImage'))
  @SerializeOptions({ groups: [GROUP_USER] })
  async create(
    @Req() req: CustomRequest,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() createBookDto: CreateBookDto,
  ): Promise<Book> {
    return this.booksService.create(req.user, coverImage, createBookDto);
  }

  @Get('all')
  @SerializeOptions({ groups: [GROUP_USER] })
  async bookFromAllUsers(): Promise<Book[]> {
    return this.booksService.bookFromAllUsers();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findAll(@Req() req: CustomRequest): Promise<Book[]> {
    return this.booksService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOne(
    @Req() req: CustomRequest,
    @Param('id') bookId: string,
  ): Promise<Book> {
    return this.booksService.findOne(req.user, +bookId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(FileInterceptor('bookImage'))
  @SerializeOptions({ groups: [GROUP_USER] })
  async update(
    @Req() req: CustomRequest,
    @Param('id') bookId: string,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.booksService.update(
      req.user,
      +bookId,
      coverImage,
      updateBookDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async remove(
    @Req() req: CustomRequest,
    @Param('id') bookId: string,
  ): Promise<Book> {
    return this.booksService.remove(req.user, +bookId);
  }
}
