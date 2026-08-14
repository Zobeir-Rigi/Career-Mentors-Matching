import {
  Body,
  Controller,
  Get,
  Put,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/guards/jwt-auth.guard';

import { MenteeProfileResponseDto } from './dto/mentee-profile-response.dto';
import { UpdateMenteeProfileDto } from './dto/update-mentee-profile.dto';
import { MenteeProfileService } from './mentee-profile.service';

@ApiTags('Mentee Profile')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('mentee-profile')
export class MenteeProfileController {
  constructor(private readonly menteeProfileService: MenteeProfileService) {}

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
}
//we always have to connect it to service, so we build a constructor, an instance of MenteeProfileService.
