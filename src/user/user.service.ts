import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async findByUsername(
    username: string,
    user?: UserEntity,
  ): Promise<UserEntity> {
    return (
      await this.userRepository.findOne({
        where: { username },
        relations: ['followers'],
      })
    ).toProfile(user);
  }

  async followUser(currentUser: UserEntity, username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['followers'],
    });
    user.followers.push(currentUser);
    await this.userRepository.save(user);
    return user.toProfile(currentUser);
  }

  async unfollowUser(currentUser: UserEntity, username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['followers'],
    });
    user.followers = user.followers.filter(
      follower => follower.id !== currentUser.id,
    );
    await this.userRepository.save(user);
    return user.toProfile(currentUser);
  }
}
