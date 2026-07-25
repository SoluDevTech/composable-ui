import { useState, useId, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/application/components/ui/badge";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";

interface StringListEditorProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export default function StringListEditor({
  label,
  value,
  onChange,
  placeholder = "Add item…",
}: Readonly<StringListEditorProps>) {
  const [inputValue, setInputValue] = useState("");
  const inputId = useId();

  function addItem() {
    const trimmed = inputValue.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInputValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId} className="text-xs uppercase tracking-[0.1em] text-muted">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-0"
          name={`${label.toLowerCase().replace(/\s+/g, "-")}-input`}
        />
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, index) => (
            <Badge key={item} variant="outline" className="gap-1 pr-1 font-mono text-xs">
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded p-0.5 transition-[background-color,color] duration-fast ease-standard hover:bg-danger/15 hover:text-danger focus-visible:outline-none focus-visible:shadow-focus"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
