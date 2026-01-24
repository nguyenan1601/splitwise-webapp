import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('groups/:groupId/activity')
  findByGroup(
    @Param('groupId') groupId: string,
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.findByGroup(
      groupId,
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
