import { Paginated } from '@common/pagination/types';

export type Country = {
  picture: string;
  code: string;
};

export type PlayerData = {
  rank: number;
  points: number;
  weight: number;
  height: number;
  age: number;
  last: number[];
};

export type Player = {
  id: number;
  firstname: string;
  lastname: string;
  shortname: string;
  sex: 'M' | 'F';
  country: Country;
  picture: string;
  data: PlayerData;
};

export type PlayersStats = {
  topCountryByWinRatio: {
    code: string;
    ratio: number;
  };
  averageBmi: number;
  medianHeight: number;
};

export type PlayersListResponse = Paginated<Player>;
