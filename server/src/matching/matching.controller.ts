import { Controller, Post, Req, UseGuards, Param, Patch } from '@nestjs/common';

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
import { MatchingRequestService } from './services/matching-request.service';

@ApiTags('Matching')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
  constructor(
    private readonly matchingAlgoService: MatchingAlgoService,
    private readonly matchingRequestService: MatchingRequestService,
  ) {}

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

  @Post('request')
  @ApiOperation({
    summary: 'Request the best available mentor match',
  })
  @ApiResponse({
    status: 200,
    description:
      'Creates a mentor proposal or places a mentee on a waiting list',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorised',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentee or matched mentor profile not found',
  })
  async requestMatch(@Req() req: RequestWithUser) {
    return this.matchingRequestService.requestMatch(req.user.userId);
  }

  @Patch('proposal/:mentorId')
  @ApiOperation({
    summary: 'Replace the current mentor proposal',
  })
  @ApiResponse({
    status: 200,
    description: 'Current proposal replaced successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentee or current proposal not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Proposal cannot be replaced from its current state.',
  })
  switchProposal(
    @Req() req: RequestWithUser,
    @Param('mentorId') mentorId: string,
  ) {
    return this.matchingRequestService.switchProposal(
      req.user.userId,
      mentorId,
    );
  }
}
