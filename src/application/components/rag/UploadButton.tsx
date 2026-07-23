import { useRef } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { useUploadFiles } from "@/application/hooks/rag/useUploadFiles";

interface UploadButtonProps {
  prefix: string;
  onUploadComplete?: () => void;
}

const ACCEPTED_EXTENSIONS =
  ".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.md,.csv,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.html,.xml,.json,.rtf,.odt,.ods";

export default function UploadButton({ prefix, onUploadComplete }: Readonly<UploadButtonProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFiles = useUploadFiles();

  function handleButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    uploadFiles.mutate(
      { prefix, files },
      {
        onSuccess: (data) => {
          if (data.kind === "all-ok") {
            toast.success(
              `${data.items.length} file${data.items.length > 1 ? "s" : ""} uploaded successfully`,
            );
          } else {
            toast.warning(`${data.succeeded} uploaded, ${data.failed} failed`);
          }
          onUploadComplete?.();
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (error: Error) => {
          toast.error(error.message);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      },
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS}
        aria-label="Choose files"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="default"
        onClick={handleButtonClick}
        disabled={uploadFiles.isPending}
        data-od-id="upload-file"
      >
        {uploadFiles.isPending ? (
          <>
            <span data-testid="upload-spinner" className="spin" aria-hidden="true" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Upload
          </>
        )}
      </Button>
    </>
  );
}
