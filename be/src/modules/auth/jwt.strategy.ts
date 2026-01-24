import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use Supabase JWT Secret to verify Supabase access tokens
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Supabase JWT payload has 'sub' as user id and 'email'
    const userId = payload.sub;
    const email = payload.email;

    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Try to find existing profile
    let user = await this.prisma.profiles.findUnique({
      where: { id: userId },
    });

    // If no profile exists, create one from Supabase user data
    if (!user && email) {
      user = await this.prisma.profiles.create({
        data: {
          id: userId,
          email: email,
          name: payload.user_metadata?.name || email.split('@')[0],
          updated_at: new Date(),
        },
      });
    }

    if (!user) {
      throw new UnauthorizedException(
        'User not found and could not be created',
      );
    }

    return user;
  }
}
