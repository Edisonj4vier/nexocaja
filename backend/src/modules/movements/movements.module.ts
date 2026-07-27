import { Module } from '@nestjs/common';
import { MovementsController } from './controllers/movements.controller';
import { MovementsService } from './services/movements.service';

@Module({
  controllers: [MovementsController],
  providers: [MovementsService],
})
export class MovementsModule {}
