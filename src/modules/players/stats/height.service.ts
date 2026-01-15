import { Injectable } from '@nestjs/common';
import { Player } from '../types/players.types';

@Injectable()
export class HeightService {
  calculateMedian(players: Player[]): number {
    if (players.length === 0) {
      return 0;
    }

    const heights = players.map((player) => player.data.height).sort((a, b) => a - b);
    const mid = Math.floor(heights.length / 2);

    return heights.length % 2 === 1
      ? heights[mid]
      : (heights[mid - 1] + heights[mid]) / 2;
  }
}
