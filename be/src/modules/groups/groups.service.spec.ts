import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { PrismaService } from '../../prisma/prisma.service';

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn((size) => ({
    toString: jest.fn(() => (size === 4 ? 'ABCD1234' : '1234567890abcdef')),
  })),
}));

describe('GroupsService', () => {
  let service: GroupsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: PrismaService,
          useValue: {
            group: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            groupMember: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new group with invite code and admin member', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const createGroupDto = {
        name: 'Test Group',
        cover_image: 'https://example.com/image.jpg',
        currency: 'USD',
      };
      const mockGroup = {
        id: '1234567890abcdef',
        name: 'Test Group',
        cover_image: 'https://example.com/image.jpg',
        currency: 'USD',
        invite_code: 'ABCD1234',
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        profiles: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
          avatar_url: null,
        },
      };

      (prismaService.group.create as jest.Mock).mockResolvedValue(mockGroup);

      // Act
      const result = await service.create(userId, createGroupDto);

      // Assert
      expect(prismaService.group.create).toHaveBeenCalledWith({
        data: {
          id: '1234567890abcdef',
          name: 'Test Group',
          cover_image: 'https://example.com/image.jpg',
          currency: 'USD',
          invite_code: 'ABCD1234',
          created_by: userId,
          updated_at: expect.any(Date),
          GroupMember: {
            create: {
              id: '1234567890abcdef',
              user_id: userId,
              role: 'ADMIN',
            },
          },
        },
        include: {
          profiles: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      });
      expect(result.invite_code).toBe('ABCD1234');
      expect(result.creator).toBeDefined();
    });

    it('should use default currency VND when not specified', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const createGroupDto = { name: 'Test Group' };

      (prismaService.group.create as jest.Mock).mockResolvedValue({
        id: 'group-id',
        currency: 'VND',
        profiles: {},
      });

      // Act
      await service.create(userId, createGroupDto);

      // Assert
      expect(prismaService.group.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currency: 'VND',
          }),
        }),
      );
    });
  });

  describe('joinByInviteCode', () => {
    it('should successfully join group with valid invite code', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const joinGroupDto = { inviteCode: 'ABCD1234' };
      const mockGroup = {
        id: 'group-id',
        name: 'Test Group',
        invite_code: 'ABCD1234',
      };
      const mockMember = {
        id: 'member-id',
        Group: mockGroup,
      };

      (prismaService.group.findUnique as jest.Mock).mockResolvedValue(
        mockGroup,
      );
      (prismaService.groupMember.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      (prismaService.groupMember.create as jest.Mock).mockResolvedValue(
        mockMember,
      );

      // Act
      const result = await service.joinByInviteCode(userId, joinGroupDto);

      // Assert
      expect(prismaService.group.findUnique).toHaveBeenCalledWith({
        where: { invite_code: 'ABCD1234' },
      });
      expect(prismaService.groupMember.create).toHaveBeenCalledWith({
        data: {
          id: '1234567890abcdef',
          group_id: 'group-id',
          user_id: userId,
          role: 'MEMBER',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockGroup);
    });

    it('should throw NotFoundException with invalid invite code', async () => {
      // Arrange
      const joinGroupDto = { inviteCode: 'INVALID' };
      (prismaService.group.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.joinByInviteCode('user-id', joinGroupDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.joinByInviteCode('user-id', joinGroupDto),
      ).rejects.toThrow('Invalid invite code');
    });

    it('should throw ConflictException when already a member', async () => {
      // Arrange
      const userId = 'user-id';
      const joinGroupDto = { inviteCode: 'ABCD1234' };
      const mockGroup = { id: 'group-id' };
      const existingMember = { id: 'member-id' };

      (prismaService.group.findUnique as jest.Mock).mockResolvedValue(
        mockGroup,
      );
      (prismaService.groupMember.findUnique as jest.Mock).mockResolvedValue(
        existingMember,
      );

      // Act & Assert
      await expect(
        service.joinByInviteCode(userId, joinGroupDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return group details with members and stats', async () => {
      // Arrange
      const groupId = 'group-id';
      const userId = 'user-id';
      const mockMember = {
        id: 'member-id',
        group_id: groupId,
        user_id: userId,
      };
      const mockGroup = {
        id: groupId,
        name: 'Test Group',
        profiles: { id: userId, name: 'Creator' },
        GroupMember: [
          {
            id: 'member-1',
            role: 'ADMIN',
            is_virtual: false,
            temp_name: null,
            joined_at: new Date(),
            profiles: { id: userId, name: 'User 1' },
          },
        ],
        _count: {
          Expense: 5,
          Settlement: 2,
        },
      };

      (prismaService.groupMember.findFirst as jest.Mock).mockResolvedValue(
        mockMember,
      );
      (prismaService.group.findUnique as jest.Mock).mockResolvedValue(
        mockGroup,
      );

      // Act
      const result = await service.findOne(groupId, userId);

      // Assert
      expect(result.members).toHaveLength(1);
      expect(result.stats).toEqual({
        expense_count: 5,
        settlement_count: 2,
      });
    });

    it('should throw ForbiddenException when user is not a member', async () => {
      // Arrange
      (prismaService.groupMember.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(service.findOne('group-id', 'user-id')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when group does not exist', async () => {
      // Arrange
      (prismaService.groupMember.findFirst as jest.Mock).mockResolvedValue({
        id: 'member-id',
      });
      (prismaService.group.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('group-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update group when user is admin', async () => {
      // Arrange
      const groupId = 'group-id';
      const userId = 'user-id';
      const updateDto = { name: 'Updated Name' };
      const adminMember = { id: 'member-id', role: 'ADMIN' };
      const updatedGroup = { id: groupId, name: 'Updated Name' };

      (prismaService.groupMember.findFirst as jest.Mock).mockResolvedValue(
        adminMember,
      );
      (prismaService.group.update as jest.Mock).mockResolvedValue(updatedGroup);

      // Act
      const result = await service.update(groupId, userId, updateDto);

      // Assert
      expect(prismaService.group.update).toHaveBeenCalledWith({
        where: { id: groupId },
        data: {
          name: 'Updated Name',
          updated_at: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedGroup);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      // Arrange
      (prismaService.groupMember.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(
        service.update('group-id', 'user-id', { name: 'Updated' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addVirtualMember', () => {
    it('should add virtual member to group', async () => {
      // Arrange
      const groupId = 'group-id';
      const userId = 'user-id';
      const addDto = { tempName: 'Virtual User' };
      const mockMember = { id: 'member-id' };
      const mockVirtualMember = {
        id: 'virtual-member-id',
        is_virtual: true,
        temp_name: 'Virtual User',
      };

      (prismaService.groupMember.findFirst as jest.Mock).mockResolvedValue(
        mockMember,
      );
      (prismaService.groupMember.create as jest.Mock).mockResolvedValue(
        mockVirtualMember,
      );

      // Act
      const result = await service.addVirtualMember(groupId, userId, addDto);

      // Assert
      expect(prismaService.groupMember.create).toHaveBeenCalledWith({
        data: {
          id: '1234567890abcdef',
          group_id: groupId,
          is_virtual: true,
          temp_name: 'Virtual User',
          role: 'MEMBER',
        },
      });
      expect(result.is_virtual).toBe(true);
    });

    it('should throw ForbiddenException when user is not a member', async () => {
      // Arrange
      (prismaService.groupMember.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(
        service.addVirtualMember('group-id', 'user-id', {
          tempName: 'Virtual',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('mergeVirtualMember', () => {
    it('should merge virtual member with real user when admin', async () => {
      // Arrange
      const groupId = 'group-id';
      const virtualMemberId = 'virtual-member-id';
      const userId = 'admin-id';
      const mergeDto = { realUserId: 'real-user-id' };
      const adminMember = { id: 'admin-member-id', role: 'ADMIN' };
      const virtualMember = {
        id: virtualMemberId,
        is_virtual: true,
        temp_name: 'Virtual',
      };
      const mergedMember = {
        id: virtualMemberId,
        user_id: 'real-user-id',
        is_virtual: false,
        temp_name: null,
      };

      (prismaService.groupMember.findFirst as jest.Mock)
        .mockResolvedValueOnce(adminMember)
        .mockResolvedValueOnce(virtualMember);
      (prismaService.groupMember.update as jest.Mock).mockResolvedValue(
        mergedMember,
      );

      // Act
      const result = await service.mergeVirtualMember(
        groupId,
        virtualMemberId,
        userId,
        mergeDto,
      );

      // Assert
      expect(prismaService.groupMember.update).toHaveBeenCalledWith({
        where: { id: virtualMemberId },
        data: {
          user_id: 'real-user-id',
          is_virtual: false,
          temp_name: null,
        },
      });
      expect(result.is_virtual).toBe(false);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      // Arrange
      (prismaService.groupMember.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(
        service.mergeVirtualMember('group-id', 'virtual-id', 'user-id', {
          realUserId: 'real-id',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when virtual member not found', async () => {
      // Arrange
      const adminMember = { id: 'admin-id', role: 'ADMIN' };
      (prismaService.groupMember.findFirst as jest.Mock)
        .mockResolvedValueOnce(adminMember)
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.mergeVirtualMember('group-id', 'virtual-id', 'user-id', {
          realUserId: 'real-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
