import { Injectable } from '@nestjs/common';
import playersData from '@data/players.json';
import { Player } from '../types/players.types';
import { PlayersRepository } from './players.repository';

type PlayersJson = {
  players: Player[];
};

@Injectable()
export class InMemoryPlayersRepository implements PlayersRepository {
  private readonly players: Player[];

  constructor() {
    const initial = (playersData as PlayersJson).players || [];
    this.players = initial.map((player) => this.clonePlayer(player));
  }

  list(): Player[] {
    return this.players.map((player) => this.clonePlayer(player));
  }

  findById(id: number): Player | null {
    const player = this.players.find((item) => item.id === id);
    return player ? this.clonePlayer(player) : null;
  }

  add(player: Player): Player {
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
