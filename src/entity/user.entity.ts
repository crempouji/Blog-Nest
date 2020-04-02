import {
  Entity,
  Column,
  BeforeInsert,
  Unique,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { IsEmail } from 'class-validator';
import { Exclude, classToPlain } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

@Entity('user')
@Unique(['username'])
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

  @ManyToMany(
    type => UserEntity,
    user => user.followee,
  )
  @JoinTable()
  followers: UserEntity[];

  @ManyToMany(
    type => UserEntity,
    user => user.followers,
  )
  followee: UserEntity[];

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

  toProfile(user: UserEntity) {
    const following = this.followers.includes(user);
    const profile: any = this.toJSON();
    delete profile.followers;
    return { ...profile, following };
  }
}
