import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSettlementDto } from './dto/settlement.dto';
import { randomBytes } from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SettlementsService {
  constructor(private prisma: PrismaService) {}

  async create(
    groupId: string,
    userId: string,
    createSettlementDto: CreateSettlementDto,
  ) {
    // Verify user is a member and get sender member id
    const senderMember = await this.prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
      },
    });

    if (!senderMember) {
      throw new ForbiddenException('Not a member of this group');
    }

    // Verify receiver is a member
    const receiverMember = await this.prisma.groupMember.findFirst({
      where: {
        id: createSettlementDto.receiverId,
        group_id: groupId,
      },
    });

    if (!receiverMember) {
      throw new BadRequestException('Receiver is not a member of this group');
    }

    if (senderMember.id === receiverMember.id) {
      throw new BadRequestException('Cannot settle with yourself');
    }

    const settlement = await this.prisma.settlement.create({
      data: {
        id: randomBytes(16).toString('hex'),
        amount: new Decimal(createSettlementDto.amount),
        note: createSettlementDto.note,
        image_url: createSettlementDto.image_url,
        group_id: groupId,
        sender_id: senderMember.id,
        receiver_id: createSettlementDto.receiverId,
      },
      include: {
        GroupMember_Settlement_sender_idToGroupMember: {
          include: {
            profiles: true,
          },
        },
        GroupMember_Settlement_receiver_idToGroupMember: {
          include: {
            profiles: true,
          },
        },
      },
    });

    return this.formatSettlement(settlement);
  }

  async findByGroup(groupId: string, userId: string) {
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

    const settlements = await this.prisma.settlement.findMany({
      where: { group_id: groupId },
      include: {
        GroupMember_Settlement_sender_idToGroupMember: {
          include: {
            profiles: true,
          },
        },
        GroupMember_Settlement_receiver_idToGroupMember: {
          include: {
            profiles: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return settlements.map((settlement) => this.formatSettlement(settlement));
  }

  async findOne(settlementId: string, userId: string) {
    const settlement = await this.prisma.settlement.findUnique({
      where: { id: settlementId },
      include: {
        Group: true,
        GroupMember_Settlement_sender_idToGroupMember: {
          include: {
            profiles: true,
          },
        },
        GroupMember_Settlement_receiver_idToGroupMember: {
          include: {
            profiles: true,
          },
        },
      },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    // Verify user is a member
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: settlement.group_id,
        user_id: userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this group');
    }

    return this.formatSettlement(settlement);
  }

  async delete(settlementId: string, userId: string) {
    const settlement = await this.prisma.settlement.findUnique({
      where: { id: settlementId },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    // Verify user is sender or receiver or admin
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: settlement.group_id,
        user_id: userId,
      },
    });

    const isSenderOrReceiver =
      settlement.sender_id === member?.id ||
      settlement.receiver_id === member?.id;

    if (!member || (!isSenderOrReceiver && member.role !== 'ADMIN')) {
      throw new ForbiddenException(
        'Only sender, receiver, or admin can delete settlement',
      );
    }

    await this.prisma.settlement.delete({
      where: { id: settlementId },
    });

    return { message: 'Settlement deleted successfully' };
  }

  private formatSettlement(settlement: any) {
    const sender = settlement.GroupMember_Settlement_sender_idToGroupMember;
    const receiver = settlement.GroupMember_Settlement_receiver_idToGroupMember;

    return {
      id: settlement.id,
      amount: parseFloat(settlement.amount.toString()),
      note: settlement.note,
      image_url: settlement.image_url,
      sender: {
        id: sender.id,
        name: sender.is_virtual ? sender.temp_name : sender.profiles?.name,
        is_virtual: sender.is_virtual,
      },
      receiver: {
        id: receiver.id,
        name: receiver.is_virtual
          ? receiver.temp_name
          : receiver.profiles?.name,
        is_virtual: receiver.is_virtual,
      },
      created_at: settlement.created_at,
    };
  }
}
