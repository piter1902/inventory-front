export interface BoxDto {
  id: string;
  identifier: string;
  name: string;
  description?: string;
  qrUrl: string;
  imageBase64?: string;
  items: ItemDto[];
}

export interface ItemDto {
  id: string;
  name: string;
  description: string;
}

export interface CreateBoxCommand {
  identifier?: string;
  name: string;
  description?: string;
  imageBase64?: string;
  items?: AddItemRequest[];
}

export interface UpdateBoxRequest {
  identifier?: string;
  name: string;
  description?: string;
  imageBase64?: string;
  items?: UpdateItemRequest[];
}

export interface AddItemRequest {
  name: string;
  description: string;
}

export interface UpdateItemRequest {
  name: string;
  description: string;
}

export interface SearchResultDto {
  boxes?: SearchBoxResultDto[];
  items?: SearchItemResultDto[];
}

export interface SearchBoxResultDto {
  id?: string;
  name?: string;
  description?: string;
  imageBase64?: string;
}

export interface SearchItemResultDto {
  id?: string;
  name?: string;
  description?: string;
  boxId?: string;
  boxName?: string;
}
