import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import playersData from '../data/players.json';
import { CreatePlayerDto } from './players.dto';
import { Player, PlayersStats } from './players.types';

type PlayersJson = {
  players: Player[];
};

@Injectable()
export class PlayersService {
  private readonly players: Player[];

  constructor() {
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
    const bmiValues: number[] = [];
    const heights: number[] = [];

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

      const heightMeters = player.data.height / 100;
      const weightKg = player.data.weight / 1000;
      if (heightMeters > 0 && weightKg > 0) {
        bmiValues.push(weightKg / (heightMeters * heightMeters));
      }

      heights.push(player.data.height);
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

    const averageBmi =
      bmiValues.length === 0
        ? 0
        : bmiValues.reduce((sum, value) => sum + value, 0) / bmiValues.length;

    const sortedHeights = [...heights].sort((a, b) => a - b);
    const mid = Math.floor(sortedHeights.length / 2);
    const medianHeight =
      sortedHeights.length % 2 === 1
        ? sortedHeights[mid]
        : (sortedHeights[mid - 1] + sortedHeights[mid]) / 2;

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
