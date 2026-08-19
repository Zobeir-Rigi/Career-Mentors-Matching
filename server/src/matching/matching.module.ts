import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MatchingController } from './matching.controller';
import { MatchingAlgoService } from './services/matching-algo.service';
import { MatchingDataService } from './services/matching-data.service';
import { MatchingRequestService } from './services/matching-request.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MatchingController],
  providers: [
    MatchingAlgoService,
    MatchingDataService,
    MatchingRequestService,
    JwtAuthGuard,
  ],
})
export class MatchingModule {}
