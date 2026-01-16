import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { BmiService } from './metric/bmi.service';
import { HeightService } from './metric/height.service';

@Module({
  controllers: [PlayersController],
  providers: [PlayersService, BmiService, HeightService]
})
export class PlayersModule {}
