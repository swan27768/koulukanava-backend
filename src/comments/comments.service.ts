import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(postId: string, content: string, currentUser: any) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        team: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Varmista että käyttäjä kuuluu tiimiin
    const membership = await this.prisma.teamMember.findFirst({
      where: {
        teamId: post.teamId!,
        userId: currentUser.id,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a team member');
    }

    return this.prisma.comment.create({
      data: {
        content,
        postId,
        authorId: currentUser.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByPost(postId: string, currentUser: any) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const membership = await this.prisma.teamMember.findFirst({
      where: {
        teamId: post.teamId!,
        userId: currentUser.id,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a team member');
    }

    return this.prisma.comment.findMany({
      where: {
        postId,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async softDelete(commentId: string, currentUser: any) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== currentUser.id && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Not allowed to delete');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        deletedAt: new Date(),
        deletedById: currentUser.id,
      },
    });
  }
}
