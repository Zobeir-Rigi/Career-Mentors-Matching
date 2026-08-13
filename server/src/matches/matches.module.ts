import { Module } from '@nestjs/common';
import { MatchesService } from './services/matches-crud.service';
import { MatchesController } from './matches.controller';
import { MatchingAlgoService } from './services/matching-algo/matching-algo.service';
import { MatchingDataService } from './services/matching-algo/matching-data.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MatchesController],
  providers: [
    MatchesService,
    MatchingAlgoService,
    MatchingDataService,
    PrismaService,
  ],
  exports: [MatchesService],
})
export class MatchesModule {}
