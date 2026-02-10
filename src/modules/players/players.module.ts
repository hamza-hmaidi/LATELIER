import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { BmiService } from './metric/bmi.service';
import { CountryWinRatioService } from './metric/country-win-ratio.service';
import { HeightService } from './metric/height.service';
import { PlayersStatisticsService } from './metric/players-statistics.service';
import { InMemoryPlayersRepository } from './repositories/in-memory-players.repository';
import { PlayersRepository } from './repositories/players.repository';

@Module({
  controllers: [PlayersController],
  providers: [
    PlayersService,
    BmiService,
    HeightService,
    CountryWinRatioService,
    PlayersStatisticsService,
    {
      provide: PlayersRepository,
      useClass: InMemoryPlayersRepository
    }
  ]
})
export class PlayersModule {}
