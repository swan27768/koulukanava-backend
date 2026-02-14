import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'dev-secret',
    });
  }

  async validate(payload: any) {
    console.log('🔎 JWT PAYLOAD:', payload);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    console.log('🔎 USER FROM DB:', user);

    // VÄLIAIKAINEN DEBUG:
    if (!user) {
      console.log('❌ USER NOT FOUND IN DB');
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      orgId: payload.orgId || null,
      role: payload.role || null,
    };
  }
}
