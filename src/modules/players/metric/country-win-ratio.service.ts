import { Injectable } from '@nestjs/common';
import { Player } from '../types/players.types';

type CountryWinRatio = {
  code: string;
  ratio: number;
};

@Injectable()
export class CountryWinRatioService {
  getTopCountryByWinRatio(players: Player[]): CountryWinRatio {
    if (players.length === 0) {
      return { code: '', ratio: 0 };
    }

    const stats = new Map<string, { wins: number; matches: number }>();

    for (const player of players) {
      const wins = this.countWins(player.data.last);
      const matches = player.data.last.length;

      const current = stats.get(player.country.code) || { wins: 0, matches: 0 };
      current.wins += wins;
      current.matches += matches;
      stats.set(player.country.code, current);
    }

    let topCountryCode = '';
    let topRatio = -1;

    for (const [code, countryStats] of stats.entries()) {
      const ratio =
        countryStats.matches === 0 ? 0 : countryStats.wins / countryStats.matches;
      if (ratio > topRatio) {
        topRatio = ratio;
        topCountryCode = code;
      }
    }

    return { code: topCountryCode, ratio: topRatio };
  }

  private countWins(results: number[]): number {
    let wins = 0;
    for (const value of results) {
      if (value === 1) {
        wins += 1;
      }
    }
    return wins;
  }
}
