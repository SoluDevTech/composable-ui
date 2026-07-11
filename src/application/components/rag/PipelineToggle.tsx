import SegmentedToggle from "@/application/components/shared/SegmentedToggle";

type Pipeline = "lightrag" | "classical";

interface PipelineToggleProps {
  value: Pipeline;
  onChange: (value: Pipeline) => void;
}

const PIPELINE_OPTIONS = [
  { value: "lightrag" as const, label: "LightRAG" },
  { value: "classical" as const, label: "Classical" },
];

export default function PipelineToggle({
  value,
  onChange,
}: Readonly<PipelineToggleProps>) {
  return (
    <SegmentedToggle
      value={value}
      options={PIPELINE_OPTIONS}
      onChange={onChange}
      pattern="toggle"
      ariaLabel="RAG pipeline selector"
      itemClassName="px-4 text-xs"
    />
  );
}