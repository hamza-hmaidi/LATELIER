import { Module } from '@nestjs/common';
import { PlayersController } from './controllers/players.controller';
import { PlayersService } from './services/players.service';
import { BmiService } from './stats/bmi.service';
import { HeightService } from './stats/height.service';

@Module({
  controllers: [PlayersController],
  providers: [PlayersService, BmiService, HeightService]
})
export class PlayersModule {}
