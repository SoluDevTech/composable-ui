interface RagTabBarProps {
  activeTab: "browse" | "query";
  onTabChange: (tab: "browse" | "query") => void;
}

const tabs = [
  { value: "browse" as const, label: "Browse" },
  { value: "query" as const, label: "Query" },
];

export default function RagTabBar({ activeTab, onTabChange }: Readonly<RagTabBarProps>) {
  return (
    <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.value}
          onClick={() => {
            if (activeTab !== tab.value) {
              onTabChange(tab.value);
            }
          }}
          className={`px-6 py-2 rounded-md font-headline text-sm font-semibold transition-colors ${
            activeTab === tab.value
              ? "bg-surface-container-lowest text-on-surface shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}