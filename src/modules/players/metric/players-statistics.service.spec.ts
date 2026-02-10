import { BmiService } from './bmi.service';
import { CountryWinRatioService } from './country-win-ratio.service';
import { HeightService } from './height.service';
import { PlayersStatisticsService } from './players-statistics.service';
import { Country, Player, PlayerData } from '../types/players.types';

const baseCountry: Country = { code: 'TST', picture: 'https://example.com/cty.png' };
const baseData: PlayerData = {
  rank: 1,
  points: 1000,
  weight: 80000,
  height: 180,
  age: 30,
  last: [1, 0, 1]
};

const basePlayer: Player = {
  id: 1,
  firstname: 'Test',
  lastname: 'Player',
  shortname: 'T.PLA',
  sex: 'M',
  country: baseCountry,
  picture: 'https://example.com/player.png',
  data: baseData
};

const makePlayer = (
  overrides: Partial<Player> & {
    data?: Partial<PlayerData>;
    country?: Partial<Country>;
  }
): Player => ({
  ...basePlayer,
  ...overrides,
  country: { ...baseCountry, ...overrides.country },
  data: { ...baseData, ...overrides.data }
});

describe('PlayersStatisticsService', () => {
  it('computes aggregate statistics with rounding', () => {
    const service = new PlayersStatisticsService(
      new BmiService(),
      new HeightService(),
      new CountryWinRatioService()
    );

    const players: Player[] = [
      makePlayer({
        id: 1,
        country: { code: 'SRB' },
        data: { height: 200, weight: 102000, last: [1, 1, 0] }
      }),
      makePlayer({
        id: 2,
        country: { code: 'USA' },
        data: { height: 180, weight: 79000, last: [1, 0] }
      })
    ];

    const stats = service.compute(players);
    expect(stats.topCountryByWinRatio.code).toBe('SRB');
    expect(stats.topCountryByWinRatio.ratio).toBeCloseTo(0.667, 3);
    expect(stats.averageBmi).toBeCloseTo(24.94, 2);
    expect(stats.medianHeight).toBe(190);
  });

  it('returns zeroed stats for empty input', () => {
    const service = new PlayersStatisticsService(
      new BmiService(),
      new HeightService(),
      new CountryWinRatioService()
    );

    expect(service.compute([])).toEqual({
      topCountryByWinRatio: { code: '', ratio: 0 },
      averageBmi: 0,
      medianHeight: 0
    });
  });
});
