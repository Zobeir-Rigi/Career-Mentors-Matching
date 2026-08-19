import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { MenteeProfileController } from './mentee-profile.controller';
import { MenteeProfileService } from './mentee-profile.service';
import { MenteeDashboardService } from './mentee-dashboard.service';
import { MenteeEngagementService } from './mentee-engagement.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MenteeProfileController],
  providers: [
    JwtAuthGuard,
    MenteeProfileService,
    MenteeDashboardService,
    MenteeEngagementService,
  ],
})
export class MenteeProfileModule {}
