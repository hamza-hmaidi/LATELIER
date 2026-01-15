import { Module } from '@nestjs/common';
import { PlayersModule } from './modules/players/players.module';

@Module({
  imports: [PlayersModule]
})
export class AppModule {}
