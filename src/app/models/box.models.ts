export interface BoxDto {
  id: string;
  identifier: string;
  name: string;
  description?: string;
  qrUrl: string;
  imageBase64?: string;
  zoneId?: string;
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
  zoneName?: string;
}

export interface SearchItemResultDto {
  id?: string;
  name?: string;
  description?: string;
  boxId?: string;
  boxName?: string;
  zoneName?: string;
}

export interface MoveItemsRequest {
  itemIds: string[];
  destinationBoxId: string;
}

export interface ItemMoveResult {
  itemId: string;
  itemName: string | null;
  success: boolean;
  error: string | null;
}

export interface MoveItemsResult {
  totalItems: number;
  successCount: number;
  failureCount: number;
  results: ItemMoveResult[];
}

export interface BoxLogEntry {
  id: string;
  itemId: string;
  itemName: string;
  sourceBoxId: string;
  sourceBoxName: string;
  destinationBoxId: string;
  destinationBoxName: string;
  movedBy: string;
  movedAt: string;
}
