import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiProperty,
  ApiOperation,
} from '@nestjs/swagger';

export class HelloResponseDto {
  @ApiProperty({
    example: 'Hello World',
  })
  message!: string;
}
@ApiTags('hello')
@Controller('hello')
export class HelloController {
  @Get()
  @ApiOperation({
    summary: 'Return the baseline greeting',
  })
  @ApiOkResponse({
    type: HelloResponseDto,
  })
  getHello(): HelloResponseDto {
    return {
      message: 'Hello World',
    };
  }
}
