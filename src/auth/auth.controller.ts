import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDtos } from './dto/auth.dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() authDto: AuthDtos) {
    return this.authService.signUp(authDto);
  }

  @Post('login')
  logIn(@Body() authDto: AuthDtos) {
    return this.authService.logIn(authDto);
  }
}
