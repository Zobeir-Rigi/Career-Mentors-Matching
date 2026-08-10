import {
  Controller,
  Get,
  Put,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { MentorsService } from './mentors.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import {
  JwtAuthGuard,
  type RequestWithUser,
} from '../auth/guards/jwt-auth.guard';
import { MentorProfileResponseDto } from './dto/mentor-profile-response.dto';

@ApiTags('Mentors')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

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
}
