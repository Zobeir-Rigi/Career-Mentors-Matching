import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MentorsController],
  providers: [MentorsService, JwtAuthGuard],
})
export class MentorsModule {}
