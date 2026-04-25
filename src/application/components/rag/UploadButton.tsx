import { useRef } from "react";
import { toast } from "sonner";
import { useUploadFile } from "@/application/hooks/rag/useUploadFile";

interface UploadButtonProps {
  prefix: string;
  onUploadComplete?: () => void;
}

export default function UploadButton({
  prefix,
  onUploadComplete,
}: Readonly<UploadButtonProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUploadFile();

  function handleButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    mutate(
      { prefix, file },
      {
        onSuccess: () => {
          toast.success("File uploaded successfully");
          onUploadComplete?.();
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      },
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.docx,.xlsx,.pptx,.md,.csv,.png,.jpg,.jpeg,.gif,.webp,.html,.xml,.json"
        aria-label="Choose file"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isPending}
        className="flex items-center gap-2 bg-primary-container text-white rounded-full px-6 py-3 font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? (
          <>
            <span
              data-testid="upload-spinner"
              className="material-symbols-outlined text-lg animate-spin"
              aria-hidden="true"
            >
              progress_activity
            </span>
            {"Uploading..."}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              upload_file
            </span>
            {"Upload"}
          </>
        )}
      </button>
    </>
  );
}
