import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiCookieAuth,
} from '@nestjs/swagger';
import {
    JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';
import { StaffMenteesResponseDto } from './dto/staff-mentees-response.dto';
import { StaffMentorsResponseDto } from './dto/staff-mentors-response.dto';
import { StaffService } from './staff.service';
@ApiTags('Mentors')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('staff')
export class StaffController {
    constructor(
        private readonly staffService: StaffService
    ) { }

    @Get('mentees')
    @ApiOperation({ summary: 'Get mentees profiles.' })
    @ApiResponse({
        status: 200,
        description: 'Mentees retrieved successfully.',
        type: StaffMentorsResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Mentees not found.' })
    async getMentees() {
        return await this.staffService.getMentees();
    }

    @Get('mentors')
    @ApiOperation({ summary: 'Get mentors profiles.' })
    @ApiResponse({
        status: 200,
        description: 'Mentors retrieved successfully.',
        type: StaffMenteesResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Mentors not found.' })
    async getMentors() {
        return await this.staffService.getMentors();
    }
}
