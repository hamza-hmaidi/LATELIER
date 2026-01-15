import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import playersData from '../data/players.json';
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

  addPlayer(input: Player): Player {
    this.validatePlayer(input);

    if (this.players.some((player) => player.id === input.id)) {
      throw new BadRequestException('Player id already exists');
    }

    const newPlayer = this.clonePlayer(input);
    this.players.push(newPlayer);
    return this.clonePlayer(newPlayer);
  }

  private validatePlayer(input: Player): void {
    const issues: string[] = [];

    if (!Number.isInteger(input?.id)) {
      issues.push('id must be an integer');
    }

    if (!this.isNonEmptyString(input?.firstname)) {
      issues.push('firstname is required');
    }

    if (!this.isNonEmptyString(input?.lastname)) {
      issues.push('lastname is required');
    }

    if (!this.isNonEmptyString(input?.shortname)) {
      issues.push('shortname is required');
    }

    if (input?.sex !== 'M' && input?.sex !== 'F') {
      issues.push('sex must be M or F');
    }

    if (!this.isNonEmptyString(input?.picture)) {
      issues.push('picture is required');
    }

    if (
      !input?.country ||
      !this.isNonEmptyString(input.country.code) ||
      !this.isNonEmptyString(input.country.picture)
    ) {
      issues.push('country.code and country.picture are required');
    }

    if (!input?.data) {
      issues.push('data is required');
    } else {
      if (!this.isPositiveNumber(input.data.rank)) {
        issues.push('data.rank must be positive');
      }
      if (!this.isNonNegativeNumber(input.data.points)) {
        issues.push('data.points must be non-negative');
      }
      if (!this.isPositiveNumber(input.data.weight)) {
        issues.push('data.weight must be positive');
      }
      if (!this.isPositiveNumber(input.data.height)) {
        issues.push('data.height must be positive');
      }
      if (!this.isPositiveNumber(input.data.age)) {
        issues.push('data.age must be positive');
      }
      if (!Array.isArray(input.data.last) || input.data.last.length === 0) {
        issues.push('data.last must be a non-empty array');
      } else if (!input.data.last.every((value) => value === 0 || value === 1)) {
        issues.push('data.last must contain only 0 or 1');
      }
    }

    if (issues.length > 0) {
      throw new BadRequestException(`Invalid player payload: ${issues.join(', ')}`);
    }
  }

  private clonePlayer(player: Player): Player {
    return {
      ...player,
      country: { ...player.country },
      data: { ...player.data, last: [...player.data.last] }
    };
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private isPositiveNumber(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
  }

  private isNonNegativeNumber(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  }

  private round(value: number, decimals: number): number {
    return Number(value.toFixed(decimals));
  }
}
