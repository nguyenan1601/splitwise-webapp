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
import { GroupsService } from './groups.service';
import {
  CreateGroupDto,
  UpdateGroupDto,
  JoinGroupDto,
  AddVirtualMemberDto,
  MergeVirtualMemberDto,
} from './dto/group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.groupsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(user.id, createGroupDto);
  }

  @Post('join')
  joinGroup(@CurrentUser() user: any, @Body() joinGroupDto: JoinGroupDto) {
    return this.groupsService.joinByInviteCode(user.id, joinGroupDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, user.id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.delete(id, user.id);
  }

  @Post(':id/members/virtual')
  addVirtualMember(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() addVirtualMemberDto: AddVirtualMemberDto,
  ) {
    return this.groupsService.addVirtualMember(
      id,
      user.id,
      addVirtualMemberDto,
    );
  }

  @Post(':id/members/:memberId/merge')
  mergeVirtualMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
    @Body() mergeDto: MergeVirtualMemberDto,
  ) {
    return this.groupsService.mergeVirtualMember(
      id,
      memberId,
      user.id,
      mergeDto,
    );
  }
}
