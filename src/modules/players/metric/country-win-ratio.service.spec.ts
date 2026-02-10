import { CountryWinRatioService } from './country-win-ratio.service';
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

describe('CountryWinRatioService', () => {
  it('returns the country with the best win ratio', () => {
    const service = new CountryWinRatioService();
    const players: Player[] = [
      makePlayer({
        id: 1,
        country: { code: 'ESP' },
        data: { last: [1, 1, 0] }
      }),
      makePlayer({
        id: 2,
        country: { code: 'USA' },
        data: { last: [1, 0, 0, 0] }
      }),
      makePlayer({
        id: 3,
        country: { code: 'ESP' },
        data: { last: [1, 1] }
      })
    ];

    const top = service.getTopCountryByWinRatio(players);
    expect(top.code).toBe('ESP');
    expect(top.ratio).toBeCloseTo(4 / 5, 3);
  });

  it('returns empty stats for no players', () => {
    const service = new CountryWinRatioService();
    expect(service.getTopCountryByWinRatio([])).toEqual({ code: '', ratio: 0 });
  });
});
