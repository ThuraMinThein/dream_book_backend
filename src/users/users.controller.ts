import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  UploadedFile,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TypeormExceptionFilter } from 'src/common/filters/exceptionfilters/typeorm-exception.filter';
import { GROUP_USER } from 'src/utils/serializers/group.serializer';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './entities/User.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.gurad';
import { CustomRequest } from 'src/common/interfaces/custom-request.interface';

@Controller({
  path: 'user',
  version: '1',
})
@UseFilters(TypeormExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
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
    return this.usersService.update(req.user, profilePicture, updateUserDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ groups: [GROUP_USER] })
  async remove(@Request() req: CustomRequest): Promise<User> {
    return this.usersService.remove(req.user);
  }
}
