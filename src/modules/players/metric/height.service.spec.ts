import { HeightService } from './height.service';
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

describe('HeightService', () => {
  it('computes the median for an odd number of players', () => {
    const service = new HeightService();
    const players: Player[] = [
      makePlayer({ id: 1, data: { height: 180 } }),
      makePlayer({ id: 2, data: { height: 200 } }),
      makePlayer({ id: 3, data: { height: 190 } })
    ];

    expect(service.calculateMedian(players)).toBe(190);
  });

  it('computes the median for an even number of players', () => {
    const service = new HeightService();
    const players: Player[] = [
      makePlayer({ id: 1, data: { height: 160 } }),
      makePlayer({ id: 2, data: { height: 180 } })
    ];

    expect(service.calculateMedian(players)).toBe(170);
  });
});
