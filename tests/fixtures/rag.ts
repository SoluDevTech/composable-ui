export interface FileEntryFixture {
  objectName: string;
  size: number;
  lastModified: string | null;
}

export interface FolderEntryFixture {
  prefix: string;
}

export function createFileEntry(
  overrides: Partial<FileEntryFixture> = {},
): FileEntryFixture {
  return {
    objectName: "docs/readme.md",
    size: 1024,
    lastModified: "2026-04-06T10:00:00Z",
    ...overrides,
  };
}

export function createFolderEntry(
  overrides: Partial<FolderEntryFixture> = {},
): FolderEntryFixture {
  return {
    prefix: "docs/",
    ...overrides,
  };
}
