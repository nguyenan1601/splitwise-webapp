import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const user = await this.prisma.profiles.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      payment_info: user.payment_info,
      created_at: user.created_at,
    };
  }

  async findByEmail(email: string) {
    return this.prisma.profiles.findUnique({
      where: { email },
    });
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.prisma.profiles.update({
      where: { id: userId },
      data: {
        ...updateUserDto,
        updated_at: new Date(),
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar_url: updatedUser.avatar_url,
      phone: updatedUser.phone,
      payment_info: updatedUser.payment_info,
    };
  }

  async getUserGroups(userId: string) {
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
    });

    return groupMembers.map((gm) => ({
      id: gm.Group.id,
      name: gm.Group.name,
      cover_image: gm.Group.cover_image,
      currency: gm.Group.currency,
      invite_code: gm.Group.invite_code,
      created_by: gm.Group.created_by,
      created_at: gm.Group.created_at,
      member_count: gm.Group._count.GroupMember,
      creator: gm.Group.profiles,
      my_role: gm.role,
    }));
  }
}
