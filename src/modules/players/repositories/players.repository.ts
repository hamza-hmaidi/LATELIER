import { Player } from '../types/players.types';

export abstract class PlayersRepository {
  abstract list(): Player[];
  abstract findById(id: number): Player | null;
  abstract add(player: Player): Player;
}
