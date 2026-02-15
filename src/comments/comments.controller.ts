import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post(':postId/comments')
  async create(
    @Param('postId') postId: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.commentsService.create(postId, body.content, req.user);
  }

  // 🔥 Cursor-based pagination
  @Get(':postId/comments')
  async list(
    @Param('postId') postId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    return this.commentsService.findByPost(
      postId,
      req.user,
      cursor,
      limit ? parseInt(limit, 10) : 5,
    );
  }

  @Patch('comments/:commentId/delete')
  async delete(@Param('commentId') commentId: string, @Request() req: any) {
    return this.commentsService.softDelete(commentId, req.user);
  }
}
