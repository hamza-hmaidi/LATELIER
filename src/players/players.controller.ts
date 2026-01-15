import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlayersService } from './players.service';
import { Player, PlayersStats } from './players.types';

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
  getPlayer(@Param('id') id: string): Player {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId)) {
      throw new BadRequestException('Invalid id');
    }
    return this.playersService.findById(parsedId);
  }

  @Post()
  addPlayer(@Body() body: Player): Player {
    return this.playersService.addPlayer(body);
  }
}
