import {
    Controller,
    Get,
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
    @Get('mentors')
    @ApiOperation({ summary: 'Get mentors profiles.' })
    @ApiResponse({
        status: 200,
        description: 'Mentors retrieved successfully.',
        type: StaffMentorsResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Mentors not found.' })
    async getMyProfile(@Req() req: RequestWithUser) {
        const user = req.user;
        return await this.staffService.getMentors();
    }
}
