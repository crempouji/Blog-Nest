import { Injectable } from '@nestjs/common';
import { CommentEntity } from 'src/entity/comment.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDTO } from 'src/model/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  findByArticleSlug(slug: string) {
    return this.commentRepository.find({
      where: { 'article.slug': slug },
      relations: ['article'],
    });
  }

  findById(id: number) {
    return this.commentRepository.findOne({ where: { id } });
  }

  async createComment(user: UserEntity, data: CreateCommentDTO) {
    const comment = await this.commentRepository.create(data);
    comment.author = user;
    await comment.save();
    return await this.commentRepository.findOne({ where: { body: data.body } });
  }

  async deleteComment(user: UserEntity, id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id, 'author.id': user.id },
    });
    await comment.remove();
    return comment;
  }
}
