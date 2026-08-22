import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';

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
    summary: 'Request the best available mentor recommendation',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns the best available mentor recommendation, an existing engagement, or waiting-list status.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorised',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentee profile not found',
  })
  async requestMatch(@Req() req: RequestWithUser) {
    return this.matchingRequestService.requestMatch(req.user.userId);
  }

  @Post('chemistry/:mentorId')
  @ApiOperation({
    summary: 'Propose a chemistry session with the selected mentor',
  })
  @ApiResponse({
    status: 201,
    description: 'Chemistry proposal created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentee or mentor profile not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Selected mentor is no longer available for matching',
  })
  proposeChemistry(
    @Req() req: RequestWithUser,
    @Param('mentorId') mentorId: string,
  ) {
    return this.matchingRequestService.proposeChemistry(
      req.user.userId,
      mentorId,
    );
  }
}
