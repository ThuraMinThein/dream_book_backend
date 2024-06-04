import {
  Post,
  Body,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
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
    return this.authService.signUp(authDto);
  }

  @Post('login')
  @UseInterceptors(ClassSerializerInterceptor)
  logIn(@Body() authDto: AuthDtos) {
    return this.authService.logIn(authDto);
  }
}
