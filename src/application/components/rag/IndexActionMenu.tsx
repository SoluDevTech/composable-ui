import { Zap } from "lucide-react";
import { Button } from "@/application/components/ui/button";

interface IndexActionMenuProps {
  onIndexClassical: () => void;
}

export default function IndexActionMenu({ onIndexClassical }: Readonly<IndexActionMenuProps>) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onIndexClassical} aria-label="Index">
      <Zap className="h-3.5 w-3.5" aria-hidden="true" />
      Index
    </Button>
  );
}
