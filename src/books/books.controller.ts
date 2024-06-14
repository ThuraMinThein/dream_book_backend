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
  BadRequestException,
  ClassSerializerInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';
import { SortBy } from '../utils/enums/sortBy.enum';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { GROUP_USER } from '../utils/serializers/group.serializer';
import { JwtOptionalGuard } from '../auth/guard/jwt-optional.guard';
import { ParseNumberPipe } from '../common/pipes/parseNumberPipe.pipe';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { ParseNumberArrayPipe } from '../common/pipes/parseNumberArrayPipe.pipe';
import { TypeormExceptionFilter } from '../common/filters/exceptionfilters/typeorm-exception.filter';

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
    if (!coverImage) throw new BadRequestException('Cover Image is required');
    try {
      return this.booksService.create(req.user, coverImage, createBookDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while creating book');
    }
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
    try {
      return this.booksService.getRecommendedBookByUser(options, req.user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching recommended books',
      );
    }
  }

  @Get('popular')
  @UseGuards(JwtOptionalGuard)
  async getPopularBooks(
    @Request() req: CustomRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ): Promise<Pagination<Book>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    try {
      return this.booksService.getPopularBooks(req.user, options);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching popular books',
      );
    }
  }

  //get books from all users
  @Get('public')
  @UseGuards(JwtOptionalGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findAll(
    @Request() req: CustomRequest,
    @Query('search') search: string,
    @Query('user_id', new ParseNumberPipe('user_id')) userId: any,
    @Query('category_ids', ParseNumberArrayPipe) categoryIds: any[],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('sortBy', new DefaultValuePipe(SortBy.DEFAULT)) sortBy: SortBy,
  ): Promise<Pagination<Book>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    try {
      return await this.booksService.findAll(
        options,
        search,
        sortBy,
        userId,
        categoryIds,
        req.user,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching public books',
      );
    }
  }

  @Get('public/:id')
  @UseGuards(JwtOptionalGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOne(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) bookId: any,
  ): Promise<Book> {
    try {
      return this.booksService.findOne(bookId, req.user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while fetching public bookId: ${bookId}`,
      );
    }
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
    try {
      return this.booksService.findAllByAuthor(req.user, sortBy, options);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching author created books',
      );
    }
  }

  @Get('author/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOneByAuthor(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) bookId: any,
  ): Promise<Book> {
    try {
      return this.booksService.findOneByAuthor(req.user, bookId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while fetching author created bookId: ${bookId}`,
      );
    }
  }

  @Get('deleted')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async getAllDeletedBooks(@Request() req: CustomRequest): Promise<Book[]> {
    try {
      return this.booksService.getAllSoftDeletedBooks(req.user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching all deleted books',
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(FileInterceptor('coverImage'))
  @SerializeOptions({ groups: [GROUP_USER] })
  async update(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) bookId: any,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    try {
      return this.booksService.update(
        req.user,
        bookId,
        coverImage,
        updateBookDto,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while updating bookId: ${bookId}`,
      );
    }
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async restore(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) bookId: any,
  ): Promise<Book> {
    try {
      return this.booksService.restore(req.user, bookId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while restoring bookId: ${bookId}`,
      );
    }
  }

  @Delete('soft/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async softDelete(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) bookId: any,
  ): Promise<Book> {
    try {
      return this.booksService.softDelete(req.user, bookId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while soft deleting bookId: ${bookId}`,
      );
    }
  }

  @Delete('hard/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async remove(
    @Request() req: CustomRequest,
    @Param('id', ParseIntPipe) bookId: any,
  ): Promise<Book> {
    try {
      return this.booksService.remove(req.user, bookId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while hard deleting bookId: ${bookId}`,
      );
    }
  }
}
