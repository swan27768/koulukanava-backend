import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(teamId: string, content: string, currentUser: any) {
    const membership = await this.prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: currentUser.id,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a team member');
    }

    return this.prisma.post.create({
      data: {
        content,
        authorId: currentUser.id,
        teamId,
        organizationId: currentUser.orgId,
      },
    });
  }
  async deletePost(postId: string, currentUser: any) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Varmista että sama organisaatio
    if (post.organizationId !== currentUser.orgId) {
      throw new ForbiddenException('Wrong organization');
    }

    // Vain ADMIN saa poistaa
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Not allowed to delete post');
    }

    // Soft delete post
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
        deletedById: currentUser.id,
      },
    });

    // Soft delete kaikki kommentit samalla
    await this.prisma.comment.updateMany({
      where: { postId },
      data: {
        deletedAt: new Date(),
        deletedById: currentUser.id,
      },
    });

    return { success: true };
  }

  async findByTeam(
    teamId: string,
    currentUser: any,
    cursor?: string,
    limit = 10,
  ) {
    // 1. varmista membership
    const membership = await this.prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: currentUser.id,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a team member');
    }

    const posts = await this.prisma.post.findMany({
      where: {
        teamId,
        deletedAt: null,
        ...(cursor && {
          createdAt: {
            lt: new Date(cursor),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: limit + 1, // haetaan yksi extra cursorin määrittämiseksi
    });

    let nextCursor: string | null = null;

    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.createdAt.toISOString();
    }

    return {
      items: posts.map((post) => ({
        id: post.id,
        content: post.content,
        pinned: post.pinned,
        type: post.type,
        createdAt: post.createdAt,
        author: post.author,
        commentsCount: post._count.comments,
      })),
      nextCursor,
    };
  }

  async togglePin(postId: string, currentUser: any) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.organizationId !== currentUser.orgId) {
      throw new ForbiddenException('Wrong organization');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        pinned: !post.pinned,
      },
    });
  }
}
