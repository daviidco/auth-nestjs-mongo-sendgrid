import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../common/decorators/public/public.decorator';
import { IHealthResponse } from './interfaces/health.interface';

@ApiExcludeController()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async checkHealth(): Promise<IHealthResponse> {
    return this.healthService.checkHealth();
  }

  @Public()
  @Get('ping')
  @HttpCode(HttpStatus.OK)
  async ping(): Promise<{ message: string; timestamp: string }> {
    return this.healthService.ping();
  }

  @Public()
  @Get('database')
  @HttpCode(HttpStatus.OK)
  async checkDatabase(): Promise<{
    status: string;
    responseTime?: number;
    error?: string;
  }> {
    return this.healthService.checkDatabase();
  }
}
