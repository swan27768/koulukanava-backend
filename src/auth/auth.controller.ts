import { Body, Controller, Post, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Public()
  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      name: string;
      password: string;
    },
  ) {
    return this.authService.register(body.email, body.name, body.password);
  }

  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
