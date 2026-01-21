import { PaginationQueryDto } from '@common/dto/pagination.query';
import { IsIn, IsOptional } from 'class-validator';


export class ListPlayersQueryDto extends PaginationQueryDto {
  @IsIn(['M', 'F'])
  @IsOptional()
  sex?: 'M' | 'F';
}
