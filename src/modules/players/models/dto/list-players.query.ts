import { PaginationQueryDto } from '@common/dto/pagination.query';
import { IsIn, IsOptional } from 'class-validator';
import { PlayerSortField, SortOrder } from '../../types/players.types';


export class ListPlayersQueryDto extends PaginationQueryDto {
  @IsIn(['M', 'F'])
  @IsOptional()
  sex?: 'M' | 'F';

  @IsIn(['rank', 'points', 'age', 'height', 'weight'])
  @IsOptional()
  sortBy?: PlayerSortField;

  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: SortOrder;
}
