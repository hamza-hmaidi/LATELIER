import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { BmiService } from './metric/bmi.service';
import { HeightService } from './metric/height.service';
import { InMemoryPlayersRepository } from './repositories/in-memory-players.repository';
import { PlayersRepository } from './repositories/players.repository';

@Module({
  controllers: [PlayersController],
  providers: [
    PlayersService,
    BmiService,
    HeightService,
    {
      provide: PlayersRepository,
      useClass: InMemoryPlayersRepository
    }
  ]
})
export class PlayersModule {}
