import { Controller, Get, Body, Patch, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Get('me/groups')
  getUserGroups(@CurrentUser() user: any) {
    return this.usersService.getUserGroups(user.id);
  }

  // Alias for frontend compatibility (PUT /profile instead of PATCH /users/me)
  @Put('profile')
  updateProfileAlias(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }
}
