import { useState } from "react";
import { Label } from "@/application/components/ui/label";
import { Textarea } from "@/application/components/ui/textarea";

interface ResponseFormatEditorProps {
  value: Record<string, unknown> | undefined;
  onChange: (value: Record<string, unknown> | undefined) => void;
}

export default function ResponseFormatEditor({
  value,
  onChange,
}: Readonly<ResponseFormatEditorProps>) {
  const [text, setText] = useState(() =>
    value ? JSON.stringify(value, null, 2) : "",
  );
  const [parseError, setParseError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setText(val);
    if (!val.trim()) {
      onChange(undefined);
      setParseError(null);
      return;
    }
    try {
      onChange(JSON.parse(val));
      setParseError(null);
    } catch {
      setParseError("Invalid JSON");
    }
  }

  return (
    <div>
      <Label htmlFor="response-format" className="text-on-surface">
        JSON Schema
      </Label>
      <Textarea
        id="response-format"
        name="response-format"
        placeholder='{"type": "object", "properties": {...}}'
        rows={6}
        value={text}
        onChange={handleChange}
        className="font-mono text-xs"
        aria-invalid={!!parseError}
        aria-describedby={parseError ? "response-format-error" : undefined}
      />
      {parseError && (
        <p
          id="response-format-error"
          role="alert"
          className="text-destructive text-xs mt-1"
        >
          {parseError}
        </p>
      )}
    </div>
  );
}
