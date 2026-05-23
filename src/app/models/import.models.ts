export interface BoxImportResult {
  sheetName: string | null;
  boxName: string | null;
  success: boolean;
  error: string | null;
}

export interface ImportBoxesResult {
  totalSheets: number;
  successCount: number;
  failureCount: number;
  results: BoxImportResult[] | null;
}
