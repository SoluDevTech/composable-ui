export interface IndexFileRequest {
  file_name: string;
  working_dir: string;
}

export interface IndexFolderRequest {
  working_dir: string;
  recursive: boolean;
  file_extensions?: string[];
}

export interface ClassicalIndexFileRequest {
  file_name: string;
  working_dir: string;
  chunk_size: number;
  chunk_overlap: number;
}

export interface ClassicalIndexFolderRequest {
  working_dir: string;
  recursive: boolean;
  file_extensions?: string[];
  chunk_size: number;
  chunk_overlap: number;
}