import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUrl,
  Min,
  ValidateNested
} from 'class-validator';

export class CountryDto {
  @IsUrl()
  picture: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class PlayerDataDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  rank: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  points: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  weight: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  height: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  age: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsIn([0, 1], { each: true })
  last: number[];
}

export class CreatePlayerDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsString()
  @IsNotEmpty()
  shortname: string;

  @IsIn(['M', 'F'])
  sex: 'M' | 'F';

  @ValidateNested()
  @Type(() => CountryDto)
  country: CountryDto;

  @IsUrl()
  picture: string;

  @ValidateNested()
  @Type(() => PlayerDataDto)
  data: PlayerDataDto;
}
