import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class PostsController {
  constructor(private postsService: PostsService) {}

  // 🔹 Luo postaus tiimiin
  @Post(':teamId/posts')
  async create(
    @Param('teamId') teamId: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.postsService.create(teamId, body.content, req.user);
  }

  // 🔹 Hae tiimin postaukset (pagination)
  @Get(':teamId/posts')
  async findAll(
    @Param('teamId') teamId: string,
    @Request() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findByTeam(
      teamId,
      req.user,
      cursor,
      limit ? parseInt(limit) : 10,
    );
  }

  // 🔹 Kiinnitä / irrota kiinnitys
  @Roles('ADMIN')
  @Patch('posts/:postId/pin')
  async togglePin(@Param('postId') postId: string, @Request() req: any) {
    return this.postsService.togglePin(postId, req.user);
  }

  // 🔹 Poista postaus (soft delete)
  @Roles('ADMIN')
  @Patch('posts/:postId/delete')
  async deletePost(@Param('postId') postId: string, @Request() req: any) {
    return this.postsService.deletePost(postId, req.user);
  }
}
