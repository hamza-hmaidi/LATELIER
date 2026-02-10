import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/errors/app.exception';
import { ErrorCodes } from '../../common/errors/error-catalog';
import { ErrorHandlerService } from '../../common/errors/error-handler.service';
import { CreatePlayerDto } from './models/dto/player.dto';
import { ListPlayersQueryDto } from './models/dto/list-players.query';
import { PlayersStatisticsService } from './metric/players-statistics.service';
import { PlayersRepository } from './repositories/players.repository';
import { Player, PlayersListResponse, PlayersStats } from './types/players.types';

@Injectable()
export class PlayersService {
  constructor(
    private readonly playersRepository: PlayersRepository,
    private readonly statisticsService: PlayersStatisticsService,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  listPlayers(query: ListPlayersQueryDto = {}): PlayersListResponse {
    try {
      return this.playersRepository.listPaginated(query);
    } catch (error) {
      this.errorHandler.handle(error, { action: 'list players' });
    }
  }

  findById(id: number): Player {
    try {
      const player = this.playersRepository.findById(id);
      if (!player) {
        throw new AppException(ErrorCodes.PLAYER_NOT_FOUND, { id });
      }
      return player;
    } catch (error) {
      this.errorHandler.handle(error, { action: 'find player', metadata: { id } });
    }
  }

  getStatistics(): PlayersStats {
    try {
      const players = this.playersRepository.list();
      return this.statisticsService.compute(players);
    } catch (error) {
      this.errorHandler.handle(error, { action: 'compute statistics' });
    }
  }

  addPlayer(input: CreatePlayerDto): Player {
    try {
      if (this.playersRepository.findById(input.id)) {
        throw new AppException(ErrorCodes.INVALID_PLAYER_PAYLOAD, {
          reason: 'duplicate id',
          id: input.id
        });
      }

      return this.playersRepository.add(input as Player);
    } catch (error) {
      this.errorHandler.handle(error, { action: 'add player', metadata: { id: input.id } });
    }
  }

}
