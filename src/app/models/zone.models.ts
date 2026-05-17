import { BoxDto } from './box.models';

export interface ZoneDto {
  id: string;
  name: string;
}

export interface ZoneDetailDto {
  id: string;
  name: string;
  boxes: BoxDto[];
}

export interface CreateZoneCommand {
  name: string;
}

export interface UpdateZoneCommand {
  id: string;
  name: string;
  boxIds?: string[];
}
