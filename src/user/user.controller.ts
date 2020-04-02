import {
  Controller,
  Get,
  UseGuards,
  Put,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../decorator/user.decorator';
import { UserEntity } from 'src/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDTO } from 'src/model/user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard())
  findCurrentUser(@User('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Put()
  @UseGuards(AuthGuard())
  update(
    @User('username') username: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: UpdateUserDTO,
  ) {
    return this.userService.updateUser(username, data);
  }
}
