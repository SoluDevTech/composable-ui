import SegmentedToggle from "@/application/components/shared/SegmentedToggle";

interface RagTabBarProps {
  activeTab: "browse" | "query";
  onTabChange: (tab: "browse" | "query") => void;
}

const TAB_OPTIONS = [
  { value: "browse" as const, label: "Browse" },
  { value: "query" as const, label: "Query" },
];

export default function RagTabBar({ activeTab, onTabChange }: Readonly<RagTabBarProps>) {
  return (
    <SegmentedToggle
      value={activeTab}
      options={TAB_OPTIONS}
      onChange={onTabChange}
      pattern="tab"
      ariaLabel="RAG view tabs"
    />
  );
}
