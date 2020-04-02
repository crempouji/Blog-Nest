import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/decorator/user.decorator';
import { UserEntity } from 'src/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get('/:username')
  async findProfile(@Param('username') username: string) {
    const profile = await this.userService.findByUsername(username);
    if (!profile) {
      throw new NotFoundException('Usuario nao escontrado');
    }
    return { profile };
  }

  @Post('/:username/follow')
  @UseGuards(AuthGuard())
  async followUser(
    @User() user: UserEntity,
    @Param('username') username: string,
  ) {
    const profile = await this.userService.followUser(user, username);
    return profile;
  }

  @Delete('/:username/follow')
  @UseGuards(AuthGuard())
  async unfollowUser(
    @User() user: UserEntity,
    @Param('username') username: string,
  ) {
    const profile = await this.userService.unfollowUser(user, username);
    return profile;
  }
}
