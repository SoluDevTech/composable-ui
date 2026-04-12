import MainLayout from "@/application/components/layout/MainLayout";
import UploadButton from "@/application/components/rag/UploadButton";

const CURRENT_PREFIX = "rag/";

export default function RagPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto px-8 py-12">
          <div className="flex items-start justify-between mb-12">
            <div>
              <h1 className="font-headline text-5xl font-bold text-on-surface mb-3">
                RAG Storage
              </h1>
              <p className="text-on-surface-variant text-sm max-w-md">
                Upload and manage files for retrieval-augmented generation.
              </p>
            </div>
            <UploadButton prefix={CURRENT_PREFIX} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
