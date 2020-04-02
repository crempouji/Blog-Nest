import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDTO } from 'src/model/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { username } });
  }

  async updateUser(username: string, data: UpdateUserDTO) {
    await this.userRepository.update({ username }, data);
    return this.findByUsername(username);
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
