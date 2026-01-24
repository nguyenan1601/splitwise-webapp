import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './modules/users/users.service';
import { UpdateUserDto } from './modules/users/dto/update-user.dto';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async checkHealth() {
    return await this.appService.checkDatabaseConnection();
  }

  // Frontend compatibility endpoint: PUT /profile
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }
}
