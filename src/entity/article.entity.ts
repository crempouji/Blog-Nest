import {
  Entity,
  Column,
  BeforeInsert,
  ManyToOne,
  ManyToMany,
  RelationCount,
  JoinTable,
} from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import * as slugify from 'slug';
import { UserEntity } from './user.entity';
import { classToPlain } from 'class-transformer';

@Entity('article')
export class ArticleEntity extends AbstractEntity {
  @Column()
  slug: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  body: string;

  @RelationCount((article: ArticleEntity) => article.favoritedBy)
  favoritesCount: number;

  @ManyToMany(
    type => UserEntity,
    user => user.favorites,
    { eager: true },
  )
  @JoinTable()
  favoritedBy: UserEntity[];

  @ManyToOne(
    type => UserEntity,
    author => author.articles,
    { eager: true },
  )
  author: UserEntity;

  @Column('simple-array')
  tagList: string[];

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.title, { lower: true });
    +'-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  toJSON() {
    return classToPlain(this);
  }

  toArticle(user?: UserEntity) {
    let favorited = null;
    if (user) {
      favorited = this.favoritedBy.map(user => user.id).includes(user.id);
    }
    const article: any = this.toJSON();
    delete article.favoritedBy;
    return { ...article, favorited };
  }
}
