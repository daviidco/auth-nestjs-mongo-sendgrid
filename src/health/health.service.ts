import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IHealthResponse } from './interfaces/health.interface';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async checkHealth(): Promise<IHealthResponse> {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();

    // Check database health
    const databaseHealth = await this.checkDatabase();

    // Check system memory and uptime
    const systemInfo = this.getSystemInfo();

    const responseTime = Date.now() - startTime;

    const isHealthy = databaseHealth.status === 'healthy';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: databaseHealth,
        memory: systemInfo.memory,
        system: systemInfo.system,
      },
      responseTime,
      statusCode: isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
    };
  }

  async ping(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'API is alive',
      timestamp: new Date().toISOString(),
    };
  }

  async checkDatabase(): Promise<{
    status: string;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Check if connection is ready
      if (this.connection.readyState !== 1) {
        return {
          status: 'unhealthy',
          error: 'Database connection not ready',
          responseTime: Date.now() - startTime,
        };
      }

      // Perform a simple database operation to verify connectivity
      await this.connection.db?.admin().ping();

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'unhealthy',
        error: error.message || 'Database connection failed',
        responseTime,
      };
    }
  }

  private getSystemInfo() {
    const memoryUsage = process.memoryUsage();

    return {
      memory: {
        used: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100,
        unit: 'MB',
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
      },
    };
  }
}
