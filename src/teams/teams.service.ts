import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async createTeam(orgId: string, name: string, isGeneral: boolean = false) {
    // Estetään duplicate GENERAL
    if (isGeneral) {
      const existing = await this.prisma.team.findFirst({
        where: {
          organizationId: orgId,
          isGeneral: true,
        },
      });

      if (existing) {
        throw new BadRequestException('GENERAL team already exists');
      }
    }

    return this.prisma.team.create({
      data: {
        name,
        organizationId: orgId,
        isGeneral,
      },
    });
  }

  async addUserToTeam(teamId: string, userId: string) {
    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
      },
    });
  }

  async getOrgTeams(orgId: string) {
    return this.prisma.team.findMany({
      where: { organizationId: orgId },
    });
  }
  async addMember(teamId: string, userId: string, currentUser: any) {
    // 1. Hae tiimi
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    // 2. Varmista että tiimi kuuluu samaan organisaatioon
    if (team.organizationId !== currentUser.orgId) {
      throw new Error('Forbidden');
    }

    // 3. Varmista että lisättävä user kuuluu samaan organisaatioon
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId: currentUser.orgId,
      },
    });

    if (!membership) {
      throw new Error('User not in this organization');
    }

    // 4. Lisää teamMember
    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
      },
    });
  }
  async getMembers(teamId: string, currentUser: any) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    if (team.organizationId !== currentUser.orgId) {
      throw new Error('Forbidden');
    }

    return this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
