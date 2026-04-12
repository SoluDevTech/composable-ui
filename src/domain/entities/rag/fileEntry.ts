export class FileEntry {
  readonly objectName: string;
  readonly size: number;
  readonly lastModified: string | null;

  constructor({
    objectName,
    size,
    lastModified,
  }: {
    objectName: string;
    size: number;
    lastModified: string | null;
  }) {
    this.objectName = objectName;
    this.size = size;
    this.lastModified = lastModified;
  }

  get filename(): string {
    const parts = this.objectName.split("/");
    return parts[parts.length - 1] || this.objectName;
  }
}

export class FolderEntry {
  readonly prefix: string;

  constructor({ prefix }: { prefix: string }) {
    this.prefix = prefix;
  }

  get name(): string {
    const trimmed = this.prefix.replace(/\/+$/, "");
    const parts = trimmed.split("/");
    return parts[parts.length - 1] || trimmed;
  }
}
