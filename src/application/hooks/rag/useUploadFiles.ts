import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ragApi } from "@/infrastructure/api/rag/ragApi";

export const DEFAULT_UPLOAD_CONCURRENCY = 3;

type UploadResult = { ok: true; value: unknown } | { ok: false; error: string };

async function mapWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<unknown>,
  limit: number,
): Promise<UploadResult[]> {
  const results: UploadResult[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      try {
        const value = await fn(items[currentIndex]);
        results[currentIndex] = { ok: true, value };
      } catch (e) {
        results[currentIndex] = {
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function getDirFromFile(file: File): string {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  if (!relativePath?.includes("/")) return "";
  const lastSlash = relativePath.lastIndexOf("/");
  return relativePath.substring(0, lastSlash + 1);
}

async function readEntries(dirReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    dirReader.readEntries(resolve, reject);
  });
}

async function traverseEntry(
  entry: FileSystemEntry,
  path: string,
  collected: File[],
): Promise<void> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    const file = await new Promise<File>((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });
    // webkitRelativePath is a readonly getter on File — defineProperty is the
    // only way to set it so getDirFromFile() can extract the folder structure.
    Object.defineProperty(file, "webkitRelativePath", {
      value: path + file.name,
      writable: false,
    });
    collected.push(file);
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const dirReader = dirEntry.createReader();
    const entries = await readEntries(dirReader);
    const newPath = path + entry.name + "/";
    await Promise.all(entries.map((e) => traverseEntry(e, newPath, collected)));
  }
}

export async function extractFilesFromDrop(items: DataTransferItemList): Promise<File[]> {
  const collected: File[] = [];
  const entries: FileSystemEntry[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind !== "file") continue;
    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      entries.push(entry);
    } else {
      const file = item.getAsFile();
      if (file) collected.push(file);
    }
  }

  await Promise.all(entries.map((e) => traverseEntry(e, "", collected)));
  return collected;
}

export type UploadOutcome =
  | { kind: "all-ok"; items: unknown[] }
  | { kind: "partial"; succeeded: number; failed: number; errors: string[] };

export function useUploadFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prefix, files }: { prefix: string; files: File[] }) => {
      const results = await mapWithConcurrency(
        files,
        (file) => ragApi.uploadFile(prefix + getDirFromFile(file), file),
        DEFAULT_UPLOAD_CONCURRENCY,
      );

      const succeeded = results.filter((r) => r.ok).length;
      const failed = results.filter((r) => !r.ok).length;
      const errors = results
        .filter((r) => !r.ok)
        .map((r) => (r as { ok: false; error: string }).error);

      if (failed === files.length && files.length > 0) {
        throw new Error(errors[0] ?? "All uploads failed");
      }

      if (failed > 0) {
        return { kind: "partial" as const, succeeded, failed, errors };
      }

      return {
        kind: "all-ok" as const,
        items: results.map((r) => (r as { ok: true; value: unknown }).value),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rag", "files"] });
      queryClient.invalidateQueries({ queryKey: ["rag", "folders"] });
    },
  });
}
