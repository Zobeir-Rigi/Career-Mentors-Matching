import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MentorDashboardService } from './mentors-dashboard.service';
import { MentorEngagementService } from './mentors-engagement.service';

@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [MentorsController],
  providers: [
    MentorsService,
    MentorDashboardService,
    MentorEngagementService,
    JwtAuthGuard,
  ],
})
export class MentorsModule {}
