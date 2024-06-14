import {
  Post,
  Body,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthDtos } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(ClassSerializerInterceptor)
  signUp(@Body() authDto: AuthDtos) {
    try {
      return this.authService.signUp(authDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while signing up user');
    }
  }

  @Post('login')
  @UseInterceptors(ClassSerializerInterceptor)
  logIn(@Body() authDto: AuthDtos) {
    try {
      return this.authService.logIn(authDto);
    } catch (error) {
      throw new InternalServerErrorException('Error while logging in user');
    }
  }
}
