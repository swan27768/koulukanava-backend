import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    console.log('FOUND USER:', user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    console.log('PASSWORD VALID:', valid);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    // Hae käyttäjän ensimmäinen organisaatio
    const membership = await this.usersService.findMembership(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      orgId: membership?.organizationId || null,
      role: membership?.role || null,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(email: string, name: string, password: string) {
    const existing = await this.usersService.findByEmail(email);

    if (existing) {
      throw new Error('User already exists');
    }

    const hash = await bcrypt.hash(password, 10);

    return this.usersService.createUser({
      email,
      name,
      passwordHash: hash,
    });
  }
}
