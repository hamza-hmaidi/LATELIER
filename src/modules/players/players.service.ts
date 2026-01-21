import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/errors/app.exception';
import { ErrorCodes } from '../../common/errors/error-catalog';
import { ErrorHandlerService } from '../../common/errors/error-handler.service';
import { CreatePlayerDto } from './models/dto/player.dto';
import { BmiService } from './metric/bmi.service';
import { HeightService } from './metric/height.service';
import { PlayersRepository } from './repositories/players.repository';
import { Player, PlayersStats } from './types/players.types';

@Injectable()
export class PlayersService {
  constructor(
    private readonly bmiService: BmiService,
    private readonly heightService: HeightService,
    private readonly playersRepository: PlayersRepository,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  listSorted(): Player[] {
    try {
      const players = this.playersRepository.list();
      return players.sort((a, b) => a.data.rank - b.data.rank);
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
      if (players.length === 0) {
        return {
          topCountryByWinRatio: { code: '', ratio: 0 },
          averageBmi: 0,
          medianHeight: 0
        };
      }

      const countryStats = new Map<string, { wins: number; matches: number }>();

      for (const player of players) {
        const wins = player.data.last.reduce(
          (sum, value) => sum + (value === 1 ? 1 : 0),
          0
        );
        const matches = player.data.last.length;

        const current = countryStats.get(player.country.code) || { wins: 0, matches: 0 };
        current.wins += wins;
        current.matches += matches;
        countryStats.set(player.country.code, current);
      }

      let topCountryCode = '';
      let topRatio = -1;
      for (const [code, stats] of countryStats.entries()) {
        const ratio = stats.matches === 0 ? 0 : stats.wins / stats.matches;
        if (ratio > topRatio) {
          topRatio = ratio;
          topCountryCode = code;
        }
      }

      const averageBmi = this.bmiService.calculateAverage(players);
      const medianHeight = this.heightService.calculateMedian(players);

      return {
        topCountryByWinRatio: {
          code: topCountryCode,
          ratio: this.round(topRatio, 3)
        },
        averageBmi: this.round(averageBmi, 2),
        medianHeight
      };
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

  private round(value: number, decimals: number): number {
    return Number(value.toFixed(decimals));
  }
}
