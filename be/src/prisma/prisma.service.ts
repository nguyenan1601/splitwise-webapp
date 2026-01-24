import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Kết nối Supabase thành công!');
    } catch (error) {
      this.logger.error('❌ Lỗi kết nối Supabase:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
