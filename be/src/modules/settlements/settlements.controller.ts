import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/settlement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post('groups/:groupId/settlements')
  create(
    @Param('groupId') groupId: string,
    @CurrentUser() user: any,
    @Body() createSettlementDto: CreateSettlementDto,
  ) {
    return this.settlementsService.create(
      groupId,
      user.id,
      createSettlementDto,
    );
  }

  @Get('groups/:groupId/settlements')
  findByGroup(@Param('groupId') groupId: string, @CurrentUser() user: any) {
    return this.settlementsService.findByGroup(groupId, user.id);
  }

  @Get('settlements/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.settlementsService.findOne(id, user.id);
  }

  @Delete('settlements/:id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.settlementsService.delete(id, user.id);
  }
}
