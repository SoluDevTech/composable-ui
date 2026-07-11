import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/application/components/ui/dialog";

interface FileContentPanelProps {
  content: string;
  metadata: { format_type: string; mime_type: string };
  tables: { headers: string[]; rows: string[][] }[];
  onClose: () => void;
}

export default function FileContentPanel({
  content,
  metadata,
  tables,
  onClose,
}: Readonly<FileContentPanelProps>) {
  const tablesRef = useRef<HTMLDivElement>(null);

  // Close on Escape is handled by Dialog primitives automatically.
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full sm:w-[480px] sm:max-w-[640px] lg:w-[640px] max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b border-outline-variant space-y-1.5">
          <DialogTitle className="font-headline text-sm font-semibold text-on-surface">
            File Content
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview of file content and extracted tables
          </DialogDescription>
        </DialogHeader>

        {/* Metadata bar */}
        <div className="px-6 py-3 border-b border-outline-variant">
          <div className="flex items-center gap-4 text-xs font-body text-on-surface-variant">
            <span className="bg-surface-container px-2 py-0.5 rounded">
              {metadata.format_type}
            </span>
            <span className="break-all">{metadata.mime_type}</span>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div
          ref={tablesRef}
          className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain"
        >
          <pre className="font-body text-sm text-on-surface whitespace-pre-wrap overflow-wrap-anywhere">
            {content}
          </pre>

          {tables.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-headline text-sm font-semibold text-on-surface">
                Tables ({tables.length})
              </h4>
              {tables.map((table, tableIdx) => (
                <div
                  key={`table-${tableIdx}-${table.headers.join("-")}`}
                  className="overflow-x-auto border border-outline-variant rounded-lg"
                >
                  <table className="min-w-full text-xs font-body">
                    <thead>
                      <tr className="bg-surface-container">
                        {table.headers.map((header) => (
                          <th
                            key={header}
                            scope="col"
                            className="px-3 py-2 text-left text-on-surface-variant font-semibold"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIdx) => (
                        <tr
                          key={`row-${tableIdx}-${rowIdx}`}
                          className="border-t border-outline-variant"
                        >
                          {row.map((cell, cellIdx) => (
                            <td
                              key={`cell-${tableIdx}-${rowIdx}-${cellIdx}`}
                              className="px-3 py-2 text-on-surface"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>

        </DialogContent>
    </Dialog>
  );
}