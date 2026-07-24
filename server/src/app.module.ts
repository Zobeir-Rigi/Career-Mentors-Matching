import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HelloModule } from './hello/hello.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, HelloModule, HealthModule],
})
export class AppModule {}
