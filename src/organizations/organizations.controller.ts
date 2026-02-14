import { Body, Controller, Post, Request } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Roles } from '../auth/roles.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  async create(
    @Body() body: { name: string; slug: string },
    @Request() req: any,
  ) {
    return this.organizationsService.createOrganization(
      body.name,
      body.slug,
      req.user.id,
    );
  }

  @Roles('ADMIN')
  @Post('admin-test')
  adminOnlyTest() {
    return { message: 'ADMIN access granted' };
  }
}
