import {
  Controller,
  Get,
  UseGuards,
  Put,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '../decorator/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDTO } from 'src/model/user.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard())
  async findCurrentUser(@User('username') username: string) {
    return await this.authService.findCurrentUser(username);
  }

  @Put()
  @UseGuards(AuthGuard())
  async update(
    @User('username') username: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: UpdateUserDTO,
  ) {
    return this.authService.updateUser(username, data);
  }
}
