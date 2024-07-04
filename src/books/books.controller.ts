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
import { SkipThrottle } from '@nestjs/throttler';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SortBy } from '../common/utils/enums/sortBy.enum';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ParseNumberPipe } from '../common/pipes/parseNumber.pipe';
import { JwtOptionalGuard } from '../auth/guard/jwt-optional.guard';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { GROUP_USER } from '../common/utils/serializers/group.serializer';
import { ParseStringArrayPipe } from '../common/pipes/parseStringArray.pipe';
import { ParseNumberArrayPipe } from '../common/pipes/parseNumberArray.pipe';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
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
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
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
      console.log(error);
      throw new InternalServerErrorException(
        'Error while fetching recommended books',
      );
    }
  }

  @Get('popular')
  @UseGuards(JwtOptionalGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
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

  @Get('related')
  @UseGuards(JwtOptionalGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async getRelatedBooks(
    @Request() req: CustomRequest,
    @Query('slug') currentBookSlug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number,
  ): Promise<Pagination<Book>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    try {
      return this.booksService.getRelatedBooks(
        currentBookSlug,
        options,
        req.user,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching related books',
      );
    }
  }

  //get books from all users
  @Get('public')
  @SkipThrottle()
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
      return this.booksService.findAll(
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

  @Get('public/:slug')
  @UseGuards(JwtOptionalGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOneWithSlug(
    @Request() req: CustomRequest,
    @Param('slug') slug: string,
  ): Promise<Book> {
    try {
      return this.booksService.findOneWithSlug(slug, req.user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while fetching public book`,
      );
    }
  }

  //get books from author
  @Get('author')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findAllByAuthor(
    @Query('search') search: string,
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
      return this.booksService.findAllByAuthor(
        req.user,
        sortBy,
        search,
        options,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching author created books',
      );
    }
  }

  @Get('author/:slug')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOneWithSlugByAuthor(
    @Request() req: CustomRequest,
    @Param('slug') slug: string,
  ): Promise<Book> {
    try {
      return this.booksService.findOneWithSlugByAuthor(req.user, slug);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while fetching author created book slug`,
      );
    }
  }

  @Get('deleted')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async getAllDeletedBooks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Request() req: CustomRequest,
  ): Promise<Pagination<Book>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };

    try {
      return this.booksService.getAllSoftDeletedBooks(req.user, options);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching all deleted books',
      );
    }
  }

  @Patch('update/:slug')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(FileInterceptor('coverImage'))
  @SerializeOptions({ groups: [GROUP_USER] })
  async update(
    @Request() req: CustomRequest,
    @Param('slug') bookSlug: string,
    @UploadedFile() coverImage: Express.Multer.File,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    try {
      return this.booksService.update(
        req.user,
        bookSlug,
        coverImage,
        updateBookDto,
      );
    } catch (error) {
      throw new InternalServerErrorException(`Error while updating book`);
    }
  }

  @Patch('restore')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async restore(
    @Request() req: CustomRequest,
    @Query('slugs', ParseStringArrayPipe) slugs: string[],
  ): Promise<Book[]> {
    if (slugs.length === 0) {
      throw new BadRequestException(
        'At least one slug is required as query param',
      );
    }
    try {
      return this.booksService.restore(req.user, slugs);
    } catch (error) {
      throw new InternalServerErrorException(`Error while restoring book`);
    }
  }

  @Delete('soft/:slug')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async softDelete(
    @Request() req: CustomRequest,
    @Param('slug') bookSlug: string,
  ): Promise<Book> {
    try {
      return this.booksService.softDelete(req.user, bookSlug);
    } catch (error) {
      throw new InternalServerErrorException(`Error while soft deleting book`);
    }
  }

  @Delete('hard')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async remove(
    @Request() req: CustomRequest,
    @Query('slugs', ParseStringArrayPipe) slugs: string[],
  ): Promise<Book[]> {
    if (slugs.length === 0) {
      throw new BadRequestException(
        'At least one slug is required as query param',
      );
    }
    try {
      return this.booksService.remove(req.user, slugs);
    } catch (error) {
      throw new InternalServerErrorException(`Error while hard deleting book`);
    }
  }
}
