import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Controller,
  UseFilters,
  UploadedFile,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.gurad';
import { GROUP_USER } from '../utils/serializers/group.serializer';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

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
    @Request() req: CustomRequest,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() createBookDto: CreateBookDto,
  ): Promise<Book> {
    return this.booksService.create(req.user, coverImage, createBookDto);
  }

  //get books from all users
  @Get('public')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(2), ParseIntPipe) limit: number,
  ): Promise<Pagination<Book>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    return await this.booksService.findAll(options);
  }

  @Get('public/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOne(@Param('id') bookId: string): Promise<Book> {
    return this.booksService.findOne(+bookId);
  }

  //get books from author
  @Get('author')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findAllByAuthor(@Request() req: CustomRequest): Promise<Book[]> {
    return this.booksService.findAllByAuthor(req.user);
  }

  @Get('author/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOneByAuthor(
    @Request() req: CustomRequest,
    @Param('id') bookId: CustomRequest,
  ): Promise<Book> {
    return this.booksService.findOneByAuthor(req.user, +bookId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(FileInterceptor('bookImage'))
  @SerializeOptions({ groups: [GROUP_USER] })
  async update(
    @Request() req: CustomRequest,
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
    @Request() req: CustomRequest,
    @Param('id') bookId: string,
  ): Promise<Book> {
    return this.booksService.remove(req.user, +bookId);
  }
}
