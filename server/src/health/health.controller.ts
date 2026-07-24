import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiProperty,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

export class HealthResponseDto {
  @ApiProperty({
    example: 'connected',
  })
  database!: string;
  @ApiProperty({
    example: 'ok',
  })
  status!: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Check application and database health',
  })
  @ApiOkResponse({
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'The database is unavailable',
  })
  async check(): Promise<HealthResponseDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
      };
    } catch {
      throw new ServiceUnavailableException('Database is unavailable');
    }
  }
}
