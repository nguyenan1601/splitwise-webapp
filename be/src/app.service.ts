import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkDatabaseConnection() {
    try {
      // Query the database to verify connection
      const result = await this.prisma.$queryRaw`SELECT 1 as test`;
      return {
        status: 'success',
        message: '✅ Kết nối Supabase thành công!',
        database: 'Connected',
        timestamp: new Date().toISOString(),
        test: result,
      };
    } catch (error) {
      return {
        status: 'error',
        message: '❌ Lỗi kết nối Supabase',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
