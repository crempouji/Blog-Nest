import { AuthService } from './auth.service';
import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { RegisterDTO, LoginDTO } from 'src/model/user.dto';

@Controller('users')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  register(@Body(ValidationPipe) credentials: { user: RegisterDTO }) {
    return this.authService.register(credentials.user);
  }

  @Post()
  login(@Body(ValidationPipe) credentials: { user: LoginDTO }) {
    return this.authService.login(credentials.user);
  }
}
