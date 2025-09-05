export interface IHealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: {
    database: {
      status: string;
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      external: number;
      unit: string;
    };
    system: {
      platform: string;
      nodeVersion: string;
      pid: number;
    };
  };
  responseTime: number;
  statusCode: number;
}
