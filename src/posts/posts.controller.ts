import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Patch } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post(':teamId/posts')
  async create(
    @Param('teamId') teamId: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.postsService.create(teamId, body.content, req.user);
  }

  @Get(':teamId/posts')
  async findAll(@Param('teamId') teamId: string, @Request() req: any) {
    return this.postsService.findByTeam(teamId, req.user);
  }
  @Roles('ADMIN')
  @Patch('/posts/:postId/pin')
  async togglePin(@Param('postId') postId: string, @Request() req: any) {
    return this.postsService.togglePin(postId, req.user);
  }
}
