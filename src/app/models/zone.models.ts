export interface ZoneDto {
  id: string;
  name: string;
}

export interface CreateZoneCommand {
  name: string;
}

export interface UpdateZoneRequest {
  name: string;
}
