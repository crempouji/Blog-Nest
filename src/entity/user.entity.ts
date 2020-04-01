import { Entity, Column, BeforeInsert, Unique } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { IsEmail } from 'class-validator';
import { Exclude, classToPlain } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

@Entity('user')
@Unique(['username', 'email'])
export class UserEntity extends AbstractEntity {
  @Column()
  @IsEmail()
  email: string;

  @Column()
  username: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: null, nullable: true })
  image: string | null;

  @Column()
  @Exclude()
  password: string;
  // To Do: add following

  @BeforeInsert()
  async hashPasssword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  toJSON() {
    return classToPlain(this);
  }

  async comparePassword(attemp: string) {
    return await bcrypt.compare(attemp, this.password);
  }
}
