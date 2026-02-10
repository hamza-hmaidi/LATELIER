import { Injectable } from '@nestjs/common';
import playersData from '@data/players.json';
import { AppException } from '../../../common/errors/app.exception';
import { ErrorCodes } from '../../../common/errors/error-catalog';
import { paginate } from '@common/pagination/paginate';
import { Paginated } from '@common/pagination/types';
import { ListPlayersParams, Player } from '../types/players.types';
import { PlayersRepository } from './players.repository';

type PlayersJson = {
  players: Player[];
};

@Injectable()
export class InMemoryPlayersRepository implements PlayersRepository {
  private readonly players: Player[];

  constructor() {
    const payload = playersData as PlayersJson;
    if (!payload || !Array.isArray(payload.players)) {
      throw new AppException(ErrorCodes.DATA_SOURCE_UNAVAILABLE);
    }

    this.players = payload.players.map((player) => this.clonePlayer(player));
  }

  list(): Player[] {
    return this.players.map((player) => this.clonePlayer(player));
  }

  listPaginated(query: ListPlayersParams = {}): Paginated<Player> {
    const sex = query.sex?.toUpperCase() as 'M' | 'F' | undefined;
    const players = this.players.map((player) => this.clonePlayer(player));

    const sortBy = query.sortBy ?? 'rank';
    const order = query.order ?? 'asc';
    const direction = order === 'desc' ? -1 : 1;

    const filtered = players.filter((player) => {
      if (sex && player.sex !== sex) {
        return false;
      }
      return true;
    });

    const sorted = filtered.sort(
      (a, b) => (a.data[sortBy] - b.data[sortBy]) * direction
    );
    return paginate(sorted, query.page, query.limit);
  }

  findById(id: number): Player | null {
    const player = this.players.find((item) => item.id === id);
    return player ? this.clonePlayer(player) : null;
  }

  add(player: Player): Player {
    if (this.players.some((item) => item.id === player.id)) {
      throw new AppException(ErrorCodes.INVALID_PLAYER_PAYLOAD, {
        reason: 'duplicate id',
        id: player.id
      });
    }

    const newPlayer = this.clonePlayer(player);
    this.players.push(newPlayer);
    return this.clonePlayer(newPlayer);
  }

  private clonePlayer(player: Player): Player {
    return {
      ...player,
      country: { ...player.country },
      data: { ...player.data, last: [...player.data.last] }
    };
  }
}
