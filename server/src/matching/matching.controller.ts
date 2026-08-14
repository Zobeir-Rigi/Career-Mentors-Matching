import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  JwtAuthGuard,
  type RequestWithUser,
} from '../auth/guards/jwt-auth.guard';

import { MatchingAlgoService } from './services/matching-algo.service';

@ApiTags('Matching')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('matching')
@Controller('matches')
export class MatchingController {
  constructor(private readonly matchingAlgoService: MatchingAlgoService) {}

  @Post('recommendations')
  @ApiOperation({
    summary: 'Find mentor recommendations for current mentee',
  })
  @ApiResponse({
    status: 200,
    description: 'Mentor recommendations calculated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentee profile not found',
  })
  async findRecommendations(@Req() req: RequestWithUser) {
    return this.matchingAlgoService.findBestMatches(req.user.userId);
  }
}
