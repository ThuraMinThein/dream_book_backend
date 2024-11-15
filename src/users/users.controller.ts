import {
  Get,
  Body,
  Patch,
  Param,
  Request,
  UseGuards,
  Controller,
  UseFilters,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { GROUP_USER } from '../common/utils/serializers/group.serializer';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { TypeormExceptionFilter } from 'src/common/filters/exceptionfilters/typeorm-exception.filter';

@Controller({
  path: 'user',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  getCurrentUser(@Request() req: CustomRequest): User {
    try {
      const user = req.user;
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching current user',
      );
    }
  }

  // @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  // @SerializeOptions({ groups: [GROUP_USER] })
  // async findAll(): Promise<User[]> {
  //   return this.usersService.findAll();
  // }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOne(@Param('id', ParseIntPipe) id: any) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(FileInterceptor('profilePicture'))
  @SerializeOptions({ groups: [GROUP_USER] })
  async update(
    @Request() req: CustomRequest,
    @UploadedFile() profilePicture: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      return this.usersService.update(req.user, profilePicture, updateUserDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while updating user');
    }
  }

  // @Delete()
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(ClassSerializerInterceptor)
  // @SerializeOptions({ groups: [GROUP_USER] })
  // async remove(@Request() req: CustomRequest): Promise<User> {
  //   try {
  //     return this.usersService.remove(req.user);
  //   } catch (error) {
  //     throw new InternalServerErrorException('Error while deleting user');
  //   }
  // }
}
