import { useState, useId, type KeyboardEvent } from "react";
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
  placeholder = "Add item...",
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
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          name={`${label.toLowerCase().replace(/\s+/g, '-')}-input`}
        />
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, index) => (
            <Badge
              key={item}
              variant="secondary"
              className="gap-1 pr-1 font-mono text-xs"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5"
                aria-label={`Remove ${item}`}
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
