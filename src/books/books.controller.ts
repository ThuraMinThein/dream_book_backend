import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  Request,
  UseGuards,
  Controller,
  UseFilters,
  UploadedFile,
  ParseIntPipe,
  UseInterceptors,
  DefaultValuePipe,
  SerializeOptions,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.gurad';
import { GROUP_USER } from '../utils/serializers/group.serializer';
import { JwtOptionalGuard } from '../auth/guard/jwt-optional.guard';
import { ParseNumberPipe } from '../common/pipes/parseNumberPipe.pipe';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { ParseNumberArrayPipe } from '../common/pipes/parseNumberArrayPipe.pipe';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';
import { SortBy } from '../utils/enums/sortBy.enum';

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

  //recommended books
  @Get('recommended')
  @UseGuards(JwtOptionalGuard)
  async getRecommendedBookByUser(
    @Request() req: CustomRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ): Promise<Pagination<Book>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    return this.booksService.getRecommendedBookByUser(req.user, options);
  }

  //get books from all users
  @Get('public')
  @UseGuards(JwtOptionalGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findAll(
    @Request() req: CustomRequest,
    @Query('search') search: string,
    @Query('popular', new DefaultValuePipe(false)) popular: boolean,
    @Query('user_id', new ParseNumberPipe('user_id')) userId: number,
    @Query('category_ids', ParseNumberArrayPipe) categoryIds: number[],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('sortBy', new DefaultValuePipe(SortBy.DEFAULT)) sortBy: SortBy,
  ): Promise<Pagination<Book>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    return await this.booksService.findAll(
      options,
      search,
      sortBy,
      userId,
      popular,
      categoryIds,
      req.user,
    );
  }

  @Get('public/:id')
  @UseGuards(JwtOptionalGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOne(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) bookId: number,
  ): Promise<Book> {
    return this.booksService.findOne(bookId, req.user);
  }

  //get books from author
  @Get('author')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findAllByAuthor(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('sortBy', new DefaultValuePipe(SortBy.DEFAULT)) sortBy: SortBy,
    @Request() req: CustomRequest,
  ): Promise<Pagination<Book>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    return this.booksService.findAllByAuthor(req.user, sortBy, options);
  }

  @Get('author/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOneByAuthor(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) bookId: number,
  ): Promise<Book> {
    return this.booksService.findOneByAuthor(req.user, bookId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(FileInterceptor('bookImage'))
  @SerializeOptions({ groups: [GROUP_USER] })
  async update(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) bookId: number,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.booksService.update(
      req.user,
      bookId,
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
    @Param('id', ParseIntPipe) bookId: number,
  ): Promise<Book> {
    return this.booksService.remove(req.user, bookId);
  }
}
