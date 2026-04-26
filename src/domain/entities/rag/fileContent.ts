export interface DocumentMetadata {
  format_type: string;
  mime_type: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface FileContentResponse {
  content: string;
  metadata: DocumentMetadata;
  tables: TableData[];
}