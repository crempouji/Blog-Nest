import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDTO, LoginDTO, UpdateUserDTO } from 'src/model/user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(credentials: RegisterDTO) {
    try {
      const user = await this.userRepository.create(credentials);
      await this.userRepository.save(user);
      const payload = { username: user.username };
      const token = this.jwtService.sign(payload);
      return { user: { ...user.toJSON(), token } };
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Username Already Exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async login({ email, password }: LoginDTO) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user || !(await user.comparePassword(password))) {
        throw new UnauthorizedException('Credentials Invalid');
      }
      const payload = { username: user.username };
      const token = this.jwtService.sign(payload);
      return { user: { ...user.toJSON(), token } };
    } catch (err) {
      if (err.status === 401) {
        throw new UnauthorizedException('Credentials Invalid');
      }
      throw new InternalServerErrorException();
    }
  }

  async findCurrentUser(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    const payload = { username };
    const token = this.jwtService.sign(payload);
    return { user: { ...user.toJSON(), token } };
  }

  async updateUser(username: string, data: UpdateUserDTO) {
    await this.userRepository.update({ username }, data);
    const user = await this.userRepository.findOne({ where: { username } });
    const payload = { username };
    const token = this.jwtService.sign(payload);
    return { user: { ...user.toJSON(), token } };
  }
}
