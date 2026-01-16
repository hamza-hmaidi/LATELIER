import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import playersData from '@data/players.json';
import { CreatePlayerDto } from './models/dto/player.dto';
import { Player, PlayersStats } from './types/players.types';
import { BmiService } from './metric/bmi.service';
import { HeightService } from './metric/height.service';

type PlayersJson = {
  players: Player[];
};

@Injectable()
export class PlayersService {
  private readonly players: Player[];

  constructor(
    private readonly bmiService: BmiService,
    private readonly heightService: HeightService
  ) {
    const initial = (playersData as PlayersJson).players || [];
    this.players = initial.map((player) => this.clonePlayer(player));
  }

  listSorted(): Player[] {
    return [...this.players]
      .sort((a, b) => a.data.rank - b.data.rank)
      .map((player) => this.clonePlayer(player));
  }

  findById(id: number): Player {
    const player = this.players.find((item) => item.id === id);
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }
    return this.clonePlayer(player);
  }

  getStatistics(): PlayersStats {
    if (this.players.length === 0) {
      return {
        topCountryByWinRatio: { code: '', ratio: 0 },
        averageBmi: 0,
        medianHeight: 0
      };
    }

    const countryStats = new Map<string, { wins: number; matches: number }>();

    for (const player of this.players) {
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

    const averageBmi = this.bmiService.calculateAverage(this.players);
    const medianHeight = this.heightService.calculateMedian(this.players);

    return {
      topCountryByWinRatio: {
        code: topCountryCode,
        ratio: this.round(topRatio, 3)
      },
      averageBmi: this.round(averageBmi, 2),
      medianHeight
    };
  }

  addPlayer(input: CreatePlayerDto): Player {
    if (this.players.some((player) => player.id === input.id)) {
      throw new BadRequestException('Player id already exists');
    }

    const newPlayer = this.clonePlayer(input as Player);
    this.players.push(newPlayer);
    return this.clonePlayer(newPlayer);
  }

  private clonePlayer(player: Player): Player {
    return {
      ...player,
      country: { ...player.country },
      data: { ...player.data, last: [...player.data.last] }
    };
  }

  private round(value: number, decimals: number): number {
    return Number(value.toFixed(decimals));
  }
}
