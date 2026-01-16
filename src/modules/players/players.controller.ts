import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PlayersService } from './players.service';
import { Player, PlayersStats } from './types/players.types';
import { CreatePlayerDto } from './models/dto/player.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  listPlayers(): Player[] {
    return this.playersService.listSorted();
  }

  @Get('statistics')
  getStatistics(): PlayersStats {
    return this.playersService.getStatistics();
  }

  @Get(':id')
  getPlayer(@Param('id', ParseIntPipe) id: number): Player {
    return this.playersService.findById(id);
  }

  @Post()
  addPlayer(@Body() body: CreatePlayerDto): Player {
    return this.playersService.addPlayer(body);
  }
}
