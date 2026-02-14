import {
  Body,
  Controller,
  Post,
  Get,
  Request,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Roles('ADMIN')
  @Post()
  async create(@Body() body: { name: string }, @Request() req: any) {
    return this.teamsService.createTeam(req.user.orgId, body.name, false);
  }

  @Get()
  async list(@Request() req: any) {
    return this.teamsService.getOrgTeams(req.user.orgId);
  }

  @Roles('ADMIN')
  @Post(':teamId/members')
  async addMember(
    @Param('teamId') teamId: string,
    @Body() body: { userId: string },
    @Request() req: any,
  ) {
    return this.teamsService.addMember(teamId, body.userId, req.user);
  }

  @Get(':teamId/members')
  async getMembers(@Param('teamId') teamId: string, @Request() req: any) {
    return this.teamsService.getMembers(teamId, req.user);
  }
}
