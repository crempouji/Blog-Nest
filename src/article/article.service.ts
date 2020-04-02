import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from 'src/entity/article.entity';
import { Repository, Like } from 'typeorm';
import { UserEntity } from 'src/entity/user.entity';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FindAllQuery,
  FindFeedQuery,
} from 'src/model/article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAll(user: UserEntity, query: FindAllQuery) {
    let findOptions: any = {
      where: {},
    };
    if (query.author) {
      findOptions.where['author.username'] = query.author;
    }
    if (query.favorited) {
      findOptions.where['favoritedBy.username'] = query.favorited;
    }
    if (query.tag) {
      findOptions.where.tagList = Like(`%${query.tag}%`);
    }
    if (query.offset) {
      findOptions.offset = query.offset;
    }
    if (query.limit) {
      findOptions.limit = query.limit;
    }
    return (await this.articleRepository.find(findOptions)).map(article =>
      article.toArticle(user),
    );
  }

  async findFeed(user: UserEntity, query: FindFeedQuery) {
    const { followee } = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['followee'],
    });
    const findOptions = {
      ...query,
      where: followee.map(follow => ({
        author: follow.id,
      })),
    };
    return (await this.articleRepository.find(findOptions)).map(article =>
      article.toArticle(user),
    );
  }

  async findBySlug(slug: string) {
    return await this.articleRepository.findOne({ where: { slug } });
  }

  private ensureOwnership(user: UserEntity, article: ArticleEntity): boolean {
    return article.author.id === user.id;
  }

  async createArticle(user: UserEntity, data: CreateArticleDTO) {
    const article = this.articleRepository.create(data);
    article.author = user;
    const { slug } = await article.save();
    return (await this.articleRepository.findOne({ slug })).toArticle();
  }

  async updateArticle(slug: string, user: UserEntity, data: UpdateArticleDTO) {
    const article = await this.findBySlug(slug);
    if (!this.ensureOwnership(user, article)) {
      throw new UnauthorizedException('You do not own this article');
    }
    await this.articleRepository.update({ slug }, data);
    return article.toArticle(user);
  }

  async deleteArticle(slug: string, user: UserEntity) {
    const article = await this.findBySlug(slug);
    if (!this.ensureOwnership(user, article)) {
      throw new UnauthorizedException('You do not own this article');
    }
    await this.articleRepository.remove(article);
  }

  async favoriteArticle(slug: string, user: UserEntity) {
    const article = await this.findBySlug(slug);
    article.favoritedBy.push(user);
    await article.save();
    return (await this.findBySlug(slug)).toArticle(user);
  }

  async unfavoriteArticle(slug: string, user: UserEntity) {
    const article = await this.findBySlug(slug);
    article.favoritedBy = article.favoritedBy.filter(fav => fav.id !== user.id);
    await article.save();
    return (await this.findBySlug(slug)).toArticle(user);
  }
}
