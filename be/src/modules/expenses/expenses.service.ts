import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { randomBytes } from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(
    groupId: string,
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ) {
    // Verify user is a member of the group
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this group');
    }

    // Verify payer is a member of the group
    const payerMember = await this.prisma.groupMember.findFirst({
      where: {
        id: createExpenseDto.payerId,
        group_id: groupId,
      },
    });

    if (!payerMember) {
      throw new BadRequestException('Payer is not a member of this group');
    }

    // Validate splits
    const splits = await this.validateAndCalculateSplits(
      groupId,
      createExpenseDto.amount,
      createExpenseDto.splits,
    );

    // Create expense with splits
    const expense = await this.prisma.expense.create({
      data: {
        id: randomBytes(16).toString('hex'),
        description: createExpenseDto.description,
        amount: new Decimal(createExpenseDto.amount),
        category: createExpenseDto.category || 'General',
        note: createExpenseDto.note,
        image_url: createExpenseDto.image_url,
        group_id: groupId,
        payer_id: createExpenseDto.payerId,
        updated_at: new Date(),
        ExpenseSplit: {
          create: splits.map((split) => ({
            id: randomBytes(16).toString('hex'),
            member_id: split.memberId,
            amount: new Decimal(split.amount),
            percentage: split.percentage ? new Decimal(split.percentage) : null,
          })),
        },
      },
      include: {
        GroupMember: {
          include: {
            profiles: true,
          },
        },
        ExpenseSplit: {
          include: {
            GroupMember: {
              include: {
                profiles: true,
              },
            },
          },
        },
      },
    });

    return this.formatExpense(expense);
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

    const expenses = await this.prisma.expense.findMany({
      where: { group_id: groupId },
      include: {
        GroupMember: {
          include: {
            profiles: true,
          },
        },
        ExpenseSplit: {
          include: {
            GroupMember: {
              include: {
                profiles: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return expenses.map((expense) => this.formatExpense(expense));
  }

  async findOne(expenseId: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        Group: true,
        GroupMember: {
          include: {
            profiles: true,
          },
        },
        ExpenseSplit: {
          include: {
            GroupMember: {
              include: {
                profiles: true,
              },
            },
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Verify user is a member
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: expense.group_id,
        user_id: userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this group');
    }

    return this.formatExpense(expense);
  }

  async update(
    expenseId: string,
    userId: string,
    updateExpenseDto: UpdateExpenseDto,
  ) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        GroupMember: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Verify user is payer or admin
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: expense.group_id,
        user_id: userId,
      },
    });

    if (
      !member ||
      (expense.payer_id !== member.id && member.role !== 'ADMIN')
    ) {
      throw new ForbiddenException('Only payer or admin can update expense');
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...updateExpenseDto,
        amount: updateExpenseDto.amount
          ? new Decimal(updateExpenseDto.amount)
          : undefined,
        updated_at: new Date(),
      },
      include: {
        GroupMember: {
          include: {
            profiles: true,
          },
        },
        ExpenseSplit: {
          include: {
            GroupMember: {
              include: {
                profiles: true,
              },
            },
          },
        },
      },
    });

    return this.formatExpense(updatedExpense);
  }

  async delete(expenseId: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Verify user is payer or admin
    const member = await this.prisma.groupMember.findFirst({
      where: {
        group_id: expense.group_id,
        user_id: userId,
      },
    });

    if (
      !member ||
      (expense.payer_id !== member.id && member.role !== 'ADMIN')
    ) {
      throw new ForbiddenException('Only payer or admin can delete expense');
    }

    await this.prisma.expense.delete({
      where: { id: expenseId },
    });

    return { message: 'Expense deleted successfully' };
  }

  async calculateGroupBalance(groupId: string, userId: string) {
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

    // Get all expenses and splits
    const expenses = await this.prisma.expense.findMany({
      where: { group_id: groupId },
      include: {
        ExpenseSplit: true,
      },
    });

    // Get all settlements
    const settlements = await this.prisma.settlement.findMany({
      where: { group_id: groupId },
    });

    // Calculate balances
    const balances: { [memberId: string]: number } = {};

    // Process expenses
    for (const expense of expenses) {
      const payerId = expense.payer_id;
      const totalAmount = parseFloat(expense.amount.toString());

      // Payer paid the full amount
      balances[payerId] = (balances[payerId] || 0) + totalAmount;

      // Each person owes their split
      for (const split of expense.ExpenseSplit) {
        const memberId = split.member_id;
        const splitAmount = parseFloat(split.amount.toString());

        balances[memberId] = (balances[memberId] || 0) - splitAmount;
      }
    }

    // Process settlements
    for (const settlement of settlements) {
      const senderId = settlement.sender_id;
      const receiverId = settlement.receiver_id;
      const amount = parseFloat(settlement.amount.toString());

      balances[senderId] = (balances[senderId] || 0) - amount;
      balances[receiverId] = (balances[receiverId] || 0) + amount;
    }

    // Get member details
    const members = await this.prisma.groupMember.findMany({
      where: { group_id: groupId },
      include: {
        profiles: true,
      },
    });

    // Format balances with member info
    const balanceDetails = members.map((member) => ({
      member_id: member.id,
      user_id: member.user_id,
      name: member.is_virtual ? member.temp_name : member.profiles?.name,
      balance: balances[member.id] || 0,
    }));

    // Calculate who owes whom (for future use)
    // const debts = this.simplifyDebts(balanceDetails);

    // Return simplified format for frontend
    return balanceDetails.map((b) => ({
      memberId: b.member_id,
      balance: b.balance,
    }));
  }

  private async validateAndCalculateSplits(
    groupId: string,
    totalAmount: number,
    splits: any[],
  ) {
    const calculatedSplits = [];

    // Check if all members are in the group
    for (const split of splits) {
      const member = await this.prisma.groupMember.findFirst({
        where: {
          id: split.memberId,
          group_id: groupId,
        },
      });

      if (!member) {
        throw new BadRequestException(
          `Member ${split.memberId} is not in this group`,
        );
      }

      let amount = 0;
      let percentage = null;

      if (split.splitType === 'EQUAL' || !split.splitType) {
        // Equal split will be calculated after we know the count
        amount = totalAmount / splits.length;
      } else if (split.splitType === 'AMOUNT') {
        amount = split.amount;
      } else if (split.splitType === 'PERCENTAGE') {
        percentage = split.percentage;
        amount = (totalAmount * split.percentage) / 100;
      }

      calculatedSplits.push({
        memberId: split.memberId,
        amount: Math.round(amount * 100) / 100,
        percentage,
      });
    }

    // Validate total matches
    const total = calculatedSplits.reduce(
      (sum, split) => sum + split.amount,
      0,
    );
    const diff = Math.abs(total - totalAmount);

    if (diff > 0.01) {
      throw new BadRequestException(
        `Split total (${total}) does not match expense amount (${totalAmount})`,
      );
    }

    return calculatedSplits;
  }

  private simplifyDebts(balances: any[]) {
    const debts = [];
    const creditors = balances.filter((b) => b.balance > 0.01);
    const debtors = balances.filter((b) => b.balance < -0.01);

    for (const debtor of debtors) {
      let remaining = Math.abs(debtor.balance);

      for (const creditor of creditors) {
        if (remaining < 0.01) break;
        if (creditor.balance < 0.01) continue;

        const amount = Math.min(remaining, creditor.balance);

        debts.push({
          from: {
            member_id: debtor.member_id,
            name: debtor.name,
          },
          to: {
            member_id: creditor.member_id,
            name: creditor.name,
          },
          amount: Math.round(amount * 100) / 100,
        });

        creditor.balance -= amount;
        remaining -= amount;
      }
    }

    return debts;
  }

  private formatExpense(expense: any) {
    return {
      id: expense.id,
      description: expense.description,
      amount: parseFloat(expense.amount.toString()),
      category: expense.category,
      note: expense.note,
      image_url: expense.image_url,
      date: expense.date,
      payer: {
        id: expense.GroupMember.id,
        name: expense.GroupMember.is_virtual
          ? expense.GroupMember.temp_name
          : expense.GroupMember.profiles?.name,
        is_virtual: expense.GroupMember.is_virtual,
      },
      splits: expense.ExpenseSplit?.map((split: any) => ({
        member_id: split.member_id,
        name: split.GroupMember.is_virtual
          ? split.GroupMember.temp_name
          : split.GroupMember.profiles?.name,
        amount: parseFloat(split.amount.toString()),
        percentage: split.percentage
          ? parseFloat(split.percentage.toString())
          : null,
      })),
      created_at: expense.created_at,
      updated_at: expense.updated_at,
    };
  }
}
