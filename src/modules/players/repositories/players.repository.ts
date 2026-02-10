import { Paginated } from '@common/pagination/types';
import { ListPlayersParams, Player } from '../types/players.types';

export abstract class PlayersRepository {
  abstract list(): Player[];
  abstract listPaginated(query?: ListPlayersParams): Paginated<Player>;
  abstract findById(id: number): Player | null;
  abstract add(player: Player): Player;
}
