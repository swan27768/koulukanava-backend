import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async createOrganization(name: string, slug: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name,
          slug,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId,
          organizationId: organization.id,
          role: 'ADMIN',
        },
      });

      // 🔹 Luo GENERAL-tiimi
      const generalTeam = await tx.team.create({
        data: {
          name: 'Yleinen',
          organizationId: organization.id,
          isGeneral: true,
        },
      });

      // 🔹 Lisää admin GENERAL-tiimiin
      await tx.teamMember.create({
        data: {
          teamId: generalTeam.id,
          userId,
        },
      });

      return {
        organization,
        generalTeam,
      };
    });
  }
}
