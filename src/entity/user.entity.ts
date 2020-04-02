import {
  Entity,
  Column,
  BeforeInsert,
  Unique,
  JoinTable,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { IsEmail } from 'class-validator';
import { Exclude, classToPlain } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { ArticleEntity } from './article.entity';

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

  @OneToMany(
    type => ArticleEntity,
    article => article.author,
  )
  articles: ArticleEntity[];

  @ManyToMany(
    type => ArticleEntity,
    article => article.favoritedBy,
  )
  @JoinColumn()
  favorites: ArticleEntity[];

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

  toProfile(user?: UserEntity) {
    let following = null;
    if (user) {
      following = this.followers.includes(user);
    }
    const profile: any = this.toJSON();
    delete profile.followers;
    return { ...profile, following };
  }
}
