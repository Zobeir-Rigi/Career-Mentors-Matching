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

import { AdminMenteesResponseDto } from './dto/admin-mentees-response.dto';
import { AdminMentorsResponseDto } from './dto/admin-mentors-response.dto';
import { AdminService } from './admin.service';
import { AdminOverviewResponseDto } from './dto/admin-overview-response.dto';
import { AdminDirectoryQueryDto } from './dto/admin-directory-query.dto';
import { UpdateMentorApprovalDto } from './dto/update-mentor-approval.dto';

@ApiTags('Admin')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('mentees')
  @ApiOperation({ summary: 'Get mentees profiles.' })
  @ApiResponse({
    status: 200,
    description: 'Mentees retrieved successfully.',
    type: AdminMenteesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Mentees not found.' })
  async getMentees(@Query() query: AdminDirectoryQueryDto) {
    return await this.adminService.getMentees(query);
  }

  @Get('mentors')
  @ApiOperation({ summary: 'Get mentors profiles.' })
  @ApiResponse({
    status: 200,
    description: 'Mentors retrieved successfully.',
    type: AdminMentorsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Mentors not found.' })
  async getMentors(@Query() query: AdminDirectoryQueryDto) {
    return await this.adminService.getMentors(query);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get mentoring programme overview' })
  @ApiResponse({
    status: 200,
    description: 'Programme overview retrieved successfully.',
    type: AdminOverviewResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getOverview() {
    return await this.adminService.getOverview();
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
    return await this.adminService.updateMentorApproval(
      mentorProfileId,
      dto.approvalStatus,
    );
  }
}
