import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDTO, LoginDTO } from 'src/model/user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async register(credentials: RegisterDTO) {
    try {
      const { username } = credentials;
      const conflict = await this.userRepository.findOne({
        where: { username },
      });
      const user = await this.userRepository.create(credentials);
      await this.userRepository.save(user);
      return user;
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
      return user;
    } catch (err) {
      if (err.status === 401) {
        throw new UnauthorizedException('Credentials Invalid');
      }
      throw new InternalServerErrorException();
    }
  }
}
