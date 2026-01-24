import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private supabase;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await this.supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      throw new ConflictException(authError.message);
    }

    // Create profile in database
    const profile = await this.prisma.profiles.create({
      data: {
        id: authData.user.id,
        email,
        name: name || null,
        updated_at: new Date(),
      },
    });

    // Generate JWT
    const payload = { sub: profile.id, email: profile.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatar_url,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user profile
    const profile = await this.prisma.profiles.findUnique({
      where: { id: authData.user.id },
    });

    if (!profile) {
      throw new UnauthorizedException('Profile not found');
    }

    // Generate JWT
    const payload = { sub: profile.id, email: profile.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatar_url,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.profiles.findUnique({
      where: { id: userId },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profiles.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar_url: profile.avatar_url,
      phone: profile.phone,
      payment_info: profile.payment_info,
    };
  }
}
