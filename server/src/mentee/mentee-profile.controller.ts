import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/guards/jwt-auth.guard';
import { CheckInResponseDto } from '../common/dto/check-in-response.dto';

import { MenteeProfileResponseDto } from './dto/mentee-profile-response.dto';
import { UpdateMenteeProfileDto } from './dto/update-mentee-profile.dto';
import { MenteeDashboardResponseDto } from './dto/mentee-dashboard-response.dto';

import { MenteeProfileService } from './mentee-profile.service';
import { MenteeDashboardService } from './mentee-dashboard.service';
import { MenteeEngagementService } from './mentee-engagement.service';

@ApiTags('Mentee')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('mentee-profile')
export class MenteeProfileController {
  constructor(
    private readonly menteeProfileService: MenteeProfileService,
    private readonly menteeDashboardService: MenteeDashboardService,
    private readonly menteeEngagementService: MenteeEngagementService,
  ) {}

  @ApiOkResponse({
    description: 'Returns the mentee profile',
    type: MenteeProfileResponseDto,
  })
  @Get()
  async getMenteeProfile(@Req() req: RequestWithUser) {
    return this.menteeProfileService.getMenteeProfile(req.user.userId);
  }

  @Put()
  async updateMenteeProfile(
    @Req() req: RequestWithUser,
    @Body() updateMenteeProfileDto: UpdateMenteeProfileDto,
  ) {
    return this.menteeProfileService.updateMenteeProfile(
      req.user.userId,
      updateMenteeProfileDto,
    );
  }

  @Patch()
  async patchMenteeProfile(
    @Req() req: RequestWithUser,
    @Body() updateMenteeProfileDto: UpdateMenteeProfileDto,
  ) {
    return this.menteeProfileService.updateMenteeProfile(
      req.user.userId,
      updateMenteeProfileDto,
    );
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get the authenticated mentee dashboard state',
  })
  @ApiOkResponse({
    description: 'Returns the mentee mentorship journey state.',
    type: MenteeDashboardResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No valid authenticated mentee session.',
  })
  getDashboard(
    @Req() request: RequestWithUser,
  ): Promise<MenteeDashboardResponseDto> {
    return this.menteeDashboardService.getDashboard(request.user.userId);
  }

  @Patch('engagements/:id/book')
  @ApiOperation({
    summary: 'Mark the chemistry session as booked',
  })
  @ApiResponse({
    status: 200,
    description: 'Chemistry session marked as booked.',
  })
  @ApiResponse({
    status: 404,
    description: 'Engagement not found for this mentee.',
  })
  @ApiResponse({
    status: 409,
    description: 'Chemistry session cannot be booked from the current state.',
  })
  bookChemistrySession(
    @Req() req: RequestWithUser,
    @Param('id') engagementId: string,
  ) {
    return this.menteeEngagementService.bookChemistry(
      req.user.userId,
      engagementId,
    );
  }

  @Patch('engagements/:id/check-in')
  @ApiOperation({
    summary: 'Submit mentee mentorship check-in response',
  })
  @ApiResponse({
    status: 200,
    description: 'Mentee check-in response recorded.',
  })
  @ApiResponse({
    status: 404,
    description: 'Engagement not found for this mentee.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Check-in response cannot be submitted from the current state.',
  })
  respondToCheckIn(
    @Req() req: RequestWithUser,
    @Param('id') engagementId: string,
    @Body() dto: CheckInResponseDto,
  ) {
    return this.menteeEngagementService.respondToCheckIn(
      req.user.userId,
      engagementId,
      dto.agreed,
    );
  }

  @Patch('engagements/:id/decline')
  @ApiOperation({
    summary: 'Decline a current mentor engagement',
  })
  @ApiResponse({
    status: 200,
    description: 'Engagement declined successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Engagement not found for this mentee.',
  })
  @ApiResponse({
    status: 409,
    description: 'Engagement cannot be declined from its current state.',
  })
  declineEngagement(
    @Req() req: RequestWithUser,
    @Param('id') engagementId: string,
  ) {
    return this.menteeEngagementService.decline(req.user.userId, engagementId);
  }

  @Patch('engagements/:id/end')
  @ApiOperation({
    summary: 'End an active mentorship',
  })
  @ApiResponse({
    status: 200,
    description: 'Mentorship ended successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Engagement not found for this mentee.',
  })
  @ApiResponse({
    status: 409,
    description: 'Engagement cannot be ended from its current state.',
  })
  endEngagement(
    @Req() req: RequestWithUser,
    @Param('id') engagementId: string,
  ) {
    return this.menteeEngagementService.end(req.user.userId, engagementId);
  }
}
