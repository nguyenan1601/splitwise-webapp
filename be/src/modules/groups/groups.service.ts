import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateGroupDto,
  UpdateGroupDto,
  JoinGroupDto,
  AddVirtualMemberDto,
  MergeVirtualMemberDto,
} from './dto/group.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async findAll(userId: string) {
    const groupMembers = await this.prisma.groupMember.findMany({
      where: { user_id: userId },
      include: {
        Group: {
          include: {
            profiles: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
            _count: {
              select: {
                GroupMember: true,
              },
            },
          },
        },
      },
      orderBy: {
        Group: {
          updated_at: 'desc',
        },
      },
    });

    return groupMembers.map((gm) => ({
      id: gm.Group.id,
      name: gm.Group.name,
      cover_image: gm.Group.cover_image,
      currency: gm.Group.currency,
      invite_code: gm.Group.invite_code,
      created_by: gm.Group.created_by,
      created_at: gm.Group.created_at,
      updated_at: gm.Group.updated_at,
      _count: gm.Group._count,
      creator: gm.Group.profiles,
      my_role: gm.role,
    }));
  }

  async create(userId: string, createGroupDto: CreateGroupDto) {
    const inviteCode = this.generateInviteCode();

    const group = await this.prisma.group.create({
      data: {
        id: randomBytes(16).toString('hex'),
        name: createGroupDto.name,
        cover_image: createGroupDto.cover_image,
        currency: createGroupDto.currency || 'VND',
        invite_code: inviteCode,
        created_by: userId,
        updated_at: new Date(),
        GroupMember: {
          create: {
            id: randomBytes(16).toString('hex'),
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

    return {
      ...group,
      creator: group.profiles,
    };
  }

  async joinByInviteCode(userId: string, joinGroupDto: JoinGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { invite_code: joinGroupDto.inviteCode },
    });

    if (!group) {
      throw new NotFoundException('Invalid invite code');
    }

    // Check if already a member
    const existingMember = await this.prisma.groupMember.findUnique({
      where: {
        group_id_user_id: {
          group_id: group.id,
          user_id: userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('Already a member of this group');
    }

    const member = await this.prisma.groupMember.create({
      data: {
        id: randomBytes(16).toString('hex'),
        group_id: group.id,
        user_id: userId,
        role: 'MEMBER',
      },
      include: {
        Group: {
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
        },
      },
    });

    return member.Group;
  }

  async findOne(groupId: string, userId: string) {
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this group');
    }

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        profiles: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
        GroupMember: {
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
        },
        _count: {
          select: {
            Expense: true,
            Settlement: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return {
      ...group,
      creator: group.profiles,
      members: group.GroupMember.map((m) => ({
        id: m.id,
        role: m.role,
        is_virtual: m.is_virtual,
        temp_name: m.temp_name,
        joined_at: m.joined_at,
        user: m.profiles,
      })),
      stats: {
        expense_count: group._count.Expense,
        settlement_count: group._count.Settlement,
      },
    };
  }

  async update(
    groupId: string,
    userId: string,
    updateGroupDto: UpdateGroupDto,
  ) {
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
        role: 'ADMIN',
      },
    });

    if (!member) {
      throw new ForbiddenException('Only admins can update group');
    }

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        ...updateGroupDto,
        updated_at: new Date(),
      },
    });

    return updatedGroup;
  }

  async delete(groupId: string, userId: string) {
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
        role: 'ADMIN',
      },
    });

    if (!member) {
      throw new ForbiddenException('Only admins can delete group');
    }

    await this.prisma.group.delete({
      where: { id: groupId },
    });

    return { message: 'Group deleted successfully' };
  }

  async addVirtualMember(
    groupId: string,
    userId: string,
    addVirtualMemberDto: AddVirtualMemberDto,
  ) {
    // Verify user is a member
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this group');
    }

    const virtualMember = await this.prisma.groupMember.create({
      data: {
        id: randomBytes(16).toString('hex'),
        group_id: groupId,
        is_virtual: true,
        temp_name: addVirtualMemberDto.tempName,
        role: 'MEMBER',
      },
    });

    return virtualMember;
  }

  async mergeVirtualMember(
    groupId: string,
    virtualMemberId: string,
    userId: string,
    mergeDto: MergeVirtualMemberDto,
  ) {
    // Verify user is an admin
    const adminMember = await this.prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
        role: 'ADMIN',
      },
    });

    if (!adminMember) {
      throw new ForbiddenException('Only admins can merge virtual members');
    }

    // Verify virtual member exists
    const virtualMember = await this.prisma.groupMember.findFirst({
      where: {
        id: virtualMemberId,
        group_id: groupId,
        is_virtual: true,
      },
    });

    if (!virtualMember) {
      throw new NotFoundException('Virtual member not found');
    }

    // Update virtual member to real user
    const mergedMember = await this.prisma.groupMember.update({
      where: { id: virtualMemberId },
      data: {
        user_id: mergeDto.realUserId,
        is_virtual: false,
        temp_name: null,
      },
    });

    return mergedMember;
  }
}
