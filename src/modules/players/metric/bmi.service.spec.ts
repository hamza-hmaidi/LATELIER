import { BmiService } from './bmi.service';
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

describe('BmiService', () => {
  it('calculates the average BMI from valid players', () => {
    const service = new BmiService();
    const players: Player[] = [
      makePlayer({
        id: 1,
        data: { height: 200, weight: 100000 }
      }),
      makePlayer({
        id: 2,
        data: { height: 180, weight: 81000 }
      })
    ];

    const average = service.calculateAverage(players);
    expect(average).toBeCloseTo(25, 2);
  });

  it('ignores invalid height/weight entries', () => {
    const service = new BmiService();
    const players: Player[] = [
      makePlayer({
        id: 1,
        data: { height: 200, weight: 100000 }
      }),
      makePlayer({
        id: 2,
        data: { height: 0, weight: 70000 }
      })
    ];

    const average = service.calculateAverage(players);
    expect(average).toBeCloseTo(25, 2);
  });
});
