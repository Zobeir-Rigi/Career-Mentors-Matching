import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';

import { StaffMenteesResponseDto } from './dto/staff-mentees-response.dto';
import { StaffMentorsResponseDto } from './dto/staff-mentors-response.dto';
import { StaffService } from './staff.service';
import { StaffOverviewResponseDto } from './dto/staff-overview-response.dto';
import { StaffDirectoryQueryDto } from './dto/staff-directory-query.dto';
import { UpdateMentorApprovalDto } from './dto/update-mentor-approval.dto';

@ApiTags('Admin')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('mentees')
  @ApiOperation({ summary: 'Get mentees profiles.' })
  @ApiResponse({
    status: 200,
    description: 'Mentees retrieved successfully.',
    type: StaffMenteesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Mentees not found.' })
  async getMentees(@Query() query: StaffDirectoryQueryDto) {
    return await this.staffService.getMentees(query);
  }

  @Get('mentors')
  @ApiOperation({ summary: 'Get mentors profiles.' })
  @ApiResponse({
    status: 200,
    description: 'Mentors retrieved successfully.',
    type: StaffMentorsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Mentors not found.' })
  async getMentors(@Query() query: StaffDirectoryQueryDto) {
    return await this.staffService.getMentors(query);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get mentoring programme overview' })
  @ApiResponse({
    status: 200,
    description: 'Programme overview retrieved successfully.',
    type: StaffOverviewResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getOverview() {
    return await this.staffService.getOverview();
  }

  @Patch('mentors/:mentorProfileId/approval')
  @ApiOperation({ summary: 'Update mentor approval status.' })
  @ApiResponse({
    status: 200,
    description: 'Mentor approval status updated successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
  async updateMentorApproval(
    @Param('mentorProfileId') mentorProfileId: string,
    @Body() dto: UpdateMentorApprovalDto,
  ) {
    return await this.staffService.updateMentorApproval(
      mentorProfileId,
      dto.approvalStatus,
    );
  }
}
