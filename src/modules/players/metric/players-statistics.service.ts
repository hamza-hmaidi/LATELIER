import { Injectable } from '@nestjs/common';
import { Player, PlayersStats } from '../types/players.types';
import { BmiService } from './bmi.service';
import { CountryWinRatioService } from './country-win-ratio.service';
import { HeightService } from './height.service';

@Injectable()
export class PlayersStatisticsService {
  constructor(
    private readonly bmiService: BmiService,
    private readonly heightService: HeightService,
    private readonly countryWinRatioService: CountryWinRatioService
  ) {}

  compute(players: Player[]): PlayersStats {
    if (players.length === 0) {
      return {
        topCountryByWinRatio: { code: '', ratio: 0 },
        averageBmi: 0,
        medianHeight: 0
      };
    }

    const topCountry = this.countryWinRatioService.getTopCountryByWinRatio(players);
    const averageBmi = this.bmiService.calculateAverage(players);
    const medianHeight = this.heightService.calculateMedian(players);

    return {
      topCountryByWinRatio: {
        code: topCountry.code,
        ratio: this.round(topCountry.ratio, 3)
      },
      averageBmi: this.round(averageBmi, 2),
      medianHeight
    };
  }

  private round(value: number, decimals: number): number {
    return Number(value.toFixed(decimals));
  }
}
