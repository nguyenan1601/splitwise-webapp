import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async create(
    groupId: string,
    actorId: string,
    action: string,
    content: string,
  ) {
    return this.prisma.activityLog.create({
      data: {
        id: randomBytes(16).toString('hex'),
        group_id: groupId,
        actor_id: actorId,
        action,
        content,
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
  }

  async findByGroup(
    groupId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Verify membership
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this group');
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { group_id: groupId },
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
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({
        where: { group_id: groupId },
      }),
    ]);

    return {
      data: activities.map((activity) => ({
        id: activity.id,
        action: activity.action,
        content: activity.content,
        actor: activity.profiles,
        created_at: activity.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
