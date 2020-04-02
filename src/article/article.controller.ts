import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Body,
  ValidationPipe,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorator/user.decorator';
import { UserEntity } from 'src/entity/user.entity';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FindAllQuery,
  FindFeedQuery,
} from 'src/model/article.dto';
import { OptionalAuthGuard } from 'src/auth/optional.auth.guard';

@Controller('articles')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@User() user: UserEntity, @Query() query: FindAllQuery) {
    const articles = await this.articleService.findAll(user, query);
    return { articles, articlesCount: articles.length };
  }

  @Get('/feed')
  @UseGuards(AuthGuard())
  async findFeed(@User() user: UserEntity, @Query() query: FindFeedQuery) {
    const articles = await this.articleService.findFeed(user, query);
    return { articles, articlesCount: articles.length };
  }

  @Get('/:slug')
  @UseGuards(OptionalAuthGuard)
  async findBySlug(@Param('slug') slug: string, @User() user: UserEntity) {
    const article = await this.articleService.findBySlug(slug);
    return { article: article.toArticle(user) };
  }

  @Post()
  @UseGuards(AuthGuard())
  async createArticle(
    @User() user: UserEntity,
    @Body(ValidationPipe) data: { article: CreateArticleDTO },
  ) {
    const article = await this.articleService.createArticle(user, data.article);
    return { article };
  }

  @Put('/:slug')
  @UseGuards(AuthGuard())
  async updateArticle(
    @User() user: UserEntity,
    @Body(ValidationPipe) data: { article: UpdateArticleDTO },
    @Param('slug') slug: string,
  ) {
    const article = await this.articleService.updateArticle(
      slug,
      user,
      data.article,
    );
    return { article };
  }

  @Delete('/:slug')
  @UseGuards(AuthGuard())
  async deleteIdea(@User() user: UserEntity, @Param('slug') slug: string) {
    const article = await this.articleService.deleteArticle(slug, user);
    return { article };
  }

  @Post('/:slug/favorite')
  @UseGuards(AuthGuard())
  async favoriteArticle(@User() user: UserEntity, @Param('slug') slug: string) {
    const article = await this.articleService.favoriteArticle(slug, user);
    return { article };
  }

  @Delete('/:slug/favorite')
  @UseGuards(AuthGuard())
  async deletefavoriteArticle(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ) {
    const article = await this.articleService.unfavoriteArticle(slug, user);
    return { article };
  }
}
