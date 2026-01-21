import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './models/dto/player.dto';
import { ListPlayersQueryDto } from './models/dto/list-players.query';
import { Player, PlayersListResponse, PlayersStats } from './types/players.types';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  listPlayers(@Query() query: ListPlayersQueryDto): PlayersListResponse {
    return this.playersService.listPlayers(query);
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
