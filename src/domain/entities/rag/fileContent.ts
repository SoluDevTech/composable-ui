export interface DocumentMetadata {
  format_type: string;
  mime_type: string;
}

export interface PageContent {
  page: number;
  content: string;
}

export interface TableData {
  markdown: string;
}

export interface FileContentResponse {
  content: PageContent[];
  metadata: DocumentMetadata | null;
  tables: TableData[] | null;
}
