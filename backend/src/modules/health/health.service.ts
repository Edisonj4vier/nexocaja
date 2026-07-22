import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getStatus() {
    return {
      status: 'ok',
      service: 'NexoCaja API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
