import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async test() {
    const users = await this.prisma.user.findMany();

    return {
      message: 'Prisma toimii',
      userCount: users.length,
    };
  }
}
