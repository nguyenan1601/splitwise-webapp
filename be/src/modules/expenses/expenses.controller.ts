import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post('groups/:groupId/expenses')
  create(
    @Param('groupId') groupId: string,
    @CurrentUser() user: any,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(groupId, user.id, createExpenseDto);
  }

  @Get('groups/:groupId/expenses')
  findByGroup(@Param('groupId') groupId: string, @CurrentUser() user: any) {
    return this.expensesService.findByGroup(groupId, user.id);
  }

  @Get('groups/:groupId/balance')
  getBalance(@Param('groupId') groupId: string, @CurrentUser() user: any) {
    return this.expensesService.calculateGroupBalance(groupId, user.id);
  }

  @Get('groups/:groupId/balances')
  getBalances(@Param('groupId') groupId: string, @CurrentUser() user: any) {
    return this.expensesService.calculateGroupBalance(groupId, user.id);
  }

  @Get('expenses/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.findOne(id, user.id);
  }

  @Patch('expenses/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, user.id, updateExpenseDto);
  }

  @Delete('expenses/:id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.delete(id, user.id);
  }
}
