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
  return (
    <div className="fixed right-0 top-0 h-full w-[480px] bg-surface-container-lowest border-l border-outline-variant shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
        <h3 className="font-headline text-sm font-semibold text-on-surface">
          File Content
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-lg text-on-surface-variant">
            close
          </span>
        </button>
      </div>

      <div className="px-6 py-3 border-b border-outline-variant">
        <div className="flex items-center gap-4 text-xs font-body text-on-surface-variant">
          <span className="bg-surface-container px-2 py-0.5 rounded">
            {metadata.format_type}
          </span>
          <span>{metadata.mime_type}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[calc(100vh-8rem)]">
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
    </div>
  );
}