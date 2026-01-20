import { ErrorHandlerService } from '../../common/errors/error-handler.service';
import { RequestContextService } from '../../common/request-context/request-context.service';
import { BmiService } from './metric/bmi.service';
import { HeightService } from './metric/height.service';
import { PlayersService } from './players.service';
import { InMemoryPlayersRepository } from './repositories/in-memory-players.repository';
import { Player } from './types/players.types';

describe('PlayersService', () => {
  let service: PlayersService;

  beforeEach(() => {
    service = new PlayersService(
      new BmiService(),
      new HeightService(),
      new InMemoryPlayersRepository(),
      new ErrorHandlerService(new RequestContextService())
    );
  });

  it('sorts players from best to worst', () => {
    const players = service.listSorted();
    for (let index = 1; index < players.length; index += 1) {
      expect(players[index - 1].data.rank).toBeLessThanOrEqual(players[index].data.rank);
    }
  });

  it('returns a player by id', () => {
    const player = service.findById(52);
    expect(player.firstname).toBe('Novak');
  });

  it('throws when player id is unknown', () => {
    expect(() => service.findById(999)).toThrow();
  });

  it('computes statistics', () => {
    const stats = service.getStatistics();
    expect(stats.topCountryByWinRatio.code).toBe('SRB');
    expect(stats.topCountryByWinRatio.ratio).toBeCloseTo(1, 3);
    expect(stats.averageBmi).toBeCloseTo(23.36, 2);
    expect(stats.medianHeight).toBe(185);
  });

  it('adds a new player', () => {
    const newPlayer: Player = {
      id: 200,
      firstname: 'Test',
      lastname: 'Player',
      shortname: 'T.PLA',
      sex: 'M',
      country: {
        picture: 'https://example.com/country.png',
        code: 'TST'
      },
      picture: 'https://example.com/player.png',
      data: {
        rank: 60,
        points: 900,
        weight: 77000,
        height: 180,
        age: 25,
        last: [1, 0, 1, 1, 0]
      }
    };

    const created = service.addPlayer(newPlayer);
    expect(created.id).toBe(200);
    expect(service.findById(200).firstname).toBe('Test');
  });

  it('rejects duplicate ids', () => {
    const duplicate = service.findById(52);
    expect(() => service.addPlayer(duplicate)).toThrow();
  });
});
