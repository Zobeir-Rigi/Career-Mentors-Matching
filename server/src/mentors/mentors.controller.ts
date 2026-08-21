import {
  Controller,
  Get,
  Put,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

import {
  JwtAuthGuard,
  type RequestWithUser,
} from '../auth/guards/jwt-auth.guard';

import { MentorsService } from './mentors.service';
import { MentorDashboardService } from './mentors-dashboard.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { MentorProfileResponseDto } from './dto/mentor-profile-response.dto';
import { MentorDashboardResponseDto } from './dto/mentor-dashboard-response.dto';
import { CheckInResponseDto } from '../common/dto/check-in-response.dto';
import { MentorEngagementService } from './mentors-engagement.service';

@ApiTags('Mentors')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('mentors')
export class MentorsController {
  constructor(
    private readonly mentorsService: MentorsService,
    private readonly mentorDashboardService: MentorDashboardService,
    private readonly mentorEngagementService: MentorEngagementService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current authenticated mentor profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
    type: MentorProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Mentor profile not found.' })
  async getMyProfile(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.mentorsService.findByUserId(user.userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Create or replace current mentor profile' })
  @ApiResponse({
    status: 201,
    description: 'Mentor profile updated successfully.',
    type: MentorProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async upsertMyProfile(
    @Req() req: RequestWithUser,
    @Body() dto: CreateMentorDto,
  ) {
    return this.mentorsService.upsertProfile(req.user.userId, dto);
  }

  @Patch('profile')
  @ApiOperation({
    summary:
      'Partially update current mentor profile (e.g. toggle availability via isAcceptingMentees or edit bio/capacity)',
  })
  @ApiResponse({
    status: 200,
    description: 'Mentor profile updated successfully',
    type: MentorProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Mentor profile not found.' })
  async updateMyProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateMentorDto,
  ) {
    return this.mentorsService.updateProfile(req.user.userId, dto);
  }

  @Delete('profile')
  @ApiOperation({ summary: 'Delete current authenticated mentor profile' })
  @ApiResponse({
    status: 200,
    description: 'Mentor profile deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Mentor profile not found.' })
  async deleteMyProfile(@Req() req: RequestWithUser) {
    return this.mentorsService.deleteProfile(req.user.userId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get current authenticated mentor dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Mentor dashboard retrieved successfully',
    type: MentorDashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Mentor profile not found.' })
  async getMyDashboard(@Req() req: RequestWithUser) {
    return this.mentorDashboardService.getDashboard(req.user.userId);
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
    description: 'Engagement not found for this mentor.',
  })
  @ApiResponse({
    status: 409,
    description: 'Engagement cannot be declined from its current state.',
  })
  async declineEngagement(
    @Req() req: RequestWithUser,
    @Param('id') engagementId: string,
  ) {
    return this.mentorEngagementService.decline(req.user.userId, engagementId);
  }

  @Patch('engagements/:id/confirm')
  @ApiOperation({
    summary: 'Confirm mentorship after the chemistry session',
  })
  @ApiResponse({
    status: 200,
    description: 'Mentorship confirmation recorded successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Engagement not found for this mentor.',
  })
  @ApiResponse({
    status: 409,
    description: 'Engagement cannot be confirmed from its current state.',
  })
  async confirmEngagement(
    @Req() req: RequestWithUser,
    @Param('id') engagementId: string,
  ) {
    return this.mentorEngagementService.confirm(req.user.userId, engagementId);
  }

  @Patch('engagements/:id/check-in')
  @ApiOperation({
    summary: 'Submit mentor mentorship check-in response',
  })
  @ApiResponse({
    status: 200,
    description: 'Mentor check-in response recorded.',
  })
  respondToCheckIn(
    @Req() req: RequestWithUser,
    @Param('id') engagementId: string,
    @Body() dto: CheckInResponseDto,
  ) {
    return this.mentorEngagementService.respondToCheckIn(
      req.user.userId,
      engagementId,
      dto.agreed,
    );
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
    description: 'Engagement not found for this mentor.',
  })
  @ApiResponse({
    status: 409,
    description: 'Engagement cannot be ended from its current state.',
  })
  async endEngagement(
    @Req() req: RequestWithUser,
    @Param('id') engagementId: string,
  ) {
    return this.mentorEngagementService.end(req.user.userId, engagementId);
  }
}
