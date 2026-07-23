import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/application/components/ui/dialog";
import { ScrollArea } from "@/application/components/ui/scroll-area";

interface PageContent {
  page: number;
  content: string;
}

interface MarkdownTable {
  markdown: string;
}

interface LegacyTable {
  headers: string[];
  rows: string[][];
}

type ContentInput = string | PageContent[];
type TablesInput = MarkdownTable[] | LegacyTable[] | null;
type MetadataInput = { format_type: string; mime_type: string } | null;

interface FileContentPanelProps {
  content: ContentInput;
  metadata: MetadataInput;
  tables: TablesInput;
  onClose: () => void;
}

function isPageArray(value: ContentInput): value is PageContent[] {
  return Array.isArray(value);
}

function isLegacyTable(value: MarkdownTable | LegacyTable): value is LegacyTable {
  return "headers" in value && "rows" in value;
}

function normalizeTables(
  tables: TablesInput,
):
  | { kind: "markdown"; tables: MarkdownTable[] }
  | { kind: "legacy"; tables: LegacyTable[] }
  | null {
  if (tables === null) return null;
  if (tables.length === 0) return { kind: "markdown", tables: [] };
  return isLegacyTable(tables[0])
    ? { kind: "legacy", tables: tables as LegacyTable[] }
    : { kind: "markdown", tables: tables as MarkdownTable[] };
}

export default function FileContentPanel({
  content,
  metadata,
  tables,
  onClose,
}: Readonly<FileContentPanelProps>) {
  const normalized = normalizeTables(tables);
  const tableCount = normalized ? normalized.tables.length : 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full sm:w-[480px] sm:max-w-[640px] lg:w-[640px] max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-4 py-3 border-b border-border space-y-1.5">
          <DialogTitle className="font-display text-lg">File Content</DialogTitle>
          <DialogDescription className="sr-only">Preview of file content</DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 border-b border-border px-4 py-2 font-mono text-xs text-muted">
          <span className="border border-border px-2 py-0.5">{metadata?.format_type ?? ""}</span>
          <span className="break-all">{metadata?.mime_type ?? ""}</span>
        </div>

        <ScrollArea className="flex-1 max-h-[70vh]">
          <div className="px-4 py-4">
            {isPageArray(content) ? (
              content.map((page, idx) => (
                <pre
                  key={`page-${page.page}-${idx}`}
                  className="font-mono text-xs text-fg-2 bg-bg p-4 mb-4 overflow-x-auto whitespace-pre-wrap"
                >
                  {page.content}
                </pre>
              ))
            ) : (
              <pre className="font-mono text-xs text-fg-2 bg-bg p-4 overflow-x-auto whitespace-pre-wrap">
                {content}
              </pre>
            )}

            {tableCount > 0 && normalized && normalized.kind === "markdown" && (
              <div className="mt-6 space-y-4">
                <h4 className="font-display text-sm text-fg">Tables ({tableCount})</h4>
                {normalized.tables.map((table, tableIdx) => {
                  const lines = table.markdown.split("\n");
                  return (
                    <pre
                      key={`table-${tableIdx}`}
                      className="font-mono text-xs text-fg-2 bg-bg p-4 overflow-x-auto whitespace-pre-wrap border border-border"
                    >
                      {lines.map((line, lineIdx) => (
                        <span key={`line-${tableIdx}-${lineIdx}`} className="block">
                          {line}
                        </span>
                      ))}
                    </pre>
                  );
                })}
              </div>
            )}

            {tableCount > 0 && normalized && normalized.kind === "legacy" && (
              <div className="mt-6 space-y-4">
                <h4 className="font-display text-sm text-fg">Tables ({tableCount})</h4>
                {normalized.tables.map((table, tableIdx) => (
                  <div
                    key={`table-${tableIdx}-${table.headers.join("-")}`}
                    className="overflow-x-auto border border-border"
                  >
                    <table className="min-w-full text-xs font-body">
                      <thead>
                        <tr className="bg-surface-warm">
                          {table.headers.map((header) => (
                            <th
                              key={header}
                              scope="col"
                              className="px-3 py-2 text-left text-muted font-semibold border-b border-border"
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
                            className="border-b border-border-soft"
                          >
                            {row.map((cell, cellIdx) => (
                              <td
                                key={`cell-${tableIdx}-${rowIdx}-${cellIdx}`}
                                className="px-3 py-2 text-fg-2"
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
