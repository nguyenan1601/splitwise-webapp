import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      admin: {
        createUser: jest.fn(),
      },
      signInWithPassword: jest.fn(),
    },
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let mockSupabase: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            profiles: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    mockSupabase = (service as any).supabase;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
      const mockAuthData = { user: { id: mockUserId } };
      const mockProfile = {
        id: mockUserId,
        email: registerDto.email,
        name: registerDto.name,
        avatar_url: null,
        phone: null,
        payment_info: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const mockToken = 'mock.jwt.token';

      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });
      (prismaService.profiles.create as jest.Mock).mockResolvedValue(
        mockProfile,
      );
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(mockSupabase.auth.admin.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        email_confirm: true,
      });
      expect(prismaService.profiles.create).toHaveBeenCalledWith({
        data: {
          id: mockUserId,
          email: registerDto.email,
          name: registerDto.name,
          updated_at: expect.any(Date),
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUserId,
        email: registerDto.email,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUserId,
          email: registerDto.email,
          name: registerDto.name,
          avatar_url: null,
        },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should register user without name (optional field)', async () => {
      // Arrange
      const dtoWithoutName = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });
      (prismaService.profiles.create as jest.Mock).mockResolvedValue({
        id: mockUserId,
        email: dtoWithoutName.email,
        name: null,
        avatar_url: null,
      });
      (jwtService.sign as jest.Mock).mockReturnValue('token');

      // Act
      const result = await service.register(dtoWithoutName as any);

      // Assert
      expect(prismaService.profiles.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: null,
        }),
      });
      expect(result.user.name).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
      const mockAuthData = { user: { id: mockUserId } };
      const mockProfile = {
        id: mockUserId,
        email: loginDto.email,
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
      };
      const mockToken = 'mock.jwt.token';

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });
      (prismaService.profiles.findUnique as jest.Mock).mockResolvedValue(
        mockProfile,
      );
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: loginDto.email,
        password: loginDto.password,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUserId,
          email: loginDto.email,
          name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      });
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      // Arrange
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when profile not found', async () => {
      // Arrange
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'some-id' } },
        error: null,
      });
      (prismaService.profiles.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Profile not found',
      );
    });
  });

  describe('validateUser', () => {
    it('should return user profile when valid userId provided', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockProfile = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };
      (prismaService.profiles.findUnique as jest.Mock).mockResolvedValue(
        mockProfile,
      );

      // Act
      const result = await service.validateUser(userId);

      // Assert
      expect(prismaService.profiles.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should return null when user not found', async () => {
      // Arrange
      (prismaService.profiles.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.validateUser('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return user profile with all fields', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockProfile = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        phone: '+1234567890',
        payment_info: { bank: 'Test Bank' },
      };
      (prismaService.profiles.findUnique as jest.Mock).mockResolvedValue(
        mockProfile,
      );

      // Act
      const result = await service.getProfile(userId);

      // Assert
      expect(result).toEqual({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        phone: '+1234567890',
        payment_info: { bank: 'Test Bank' },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      (prismaService.profiles.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        'User not found',
      );
    });
  });
});
