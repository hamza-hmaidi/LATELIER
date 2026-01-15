import { Injectable } from '@nestjs/common';
import { Player } from '../types/players.types';

@Injectable()
export class BmiService {
  calculateAverage(players: Player[]): number {
    const values: number[] = [];

    for (const player of players) {
      const heightMeters = player.data.height / 100;
      const weightKg = player.data.weight / 1000;
      if (heightMeters > 0 && weightKg > 0) {
        values.push(weightKg / (heightMeters * heightMeters));
      }
    }

    if (values.length === 0) {
      return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}
