import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(teamId: string, content: string, currentUser: any) {
    // Varmista että käyttäjä kuuluu tiimiin
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

  async findByTeam(teamId: string, currentUser: any) {
  const posts = await this.prisma.post.findMany({
    where: {
      teamId,
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
      _count: {
        select: {
          comments: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
    orderBy: [
      { pinned: 'desc' },
      { updatedAt: 'desc' },
    ],
  });

  return posts.map((post) => ({
    id: post.id,
    content: post.content,
    pinned: post.pinned,
    type: post.type,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    commentsCount: post._count.comments,
  }));

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
