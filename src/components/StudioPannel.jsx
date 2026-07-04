import { useState } from "react";
import {
  FileText,
  ListChecks,
  HelpCircle,
  Clock,
  AudioLines,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";

const ARTIFACT_TYPES = [
  { type: "summary", label: "Summary", icon: FileText },
  { type: "study_guide", label: "Study guide", icon: ListChecks },
  { type: "faq", label: "FAQ", icon: HelpCircle },
  { type: "timeline", label: "Timeline", icon: Clock },
  { type: "audio_overview", label: "Audio overview", icon: AudioLines },
];

const ARTIFACT_LABEL = {
  summary: "Summary",
  study_guide: "Study guide",
  faq: "FAQ",
  timeline: "Timeline",
  audio_overview: "Audio overview",
};

export default function StudioPanel({
  artifacts,
  loading,
  generatingType,
  hasSources,
  onGenerate,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-(--rule)">
        <h2 className="font-(family-name:--font-display) text-base">Studio</h2>
        <p className="text-xs text-(--ink-soft) mt-0.5">
          Generate notes from your sources.
        </p>
      </div>

      <div className="px-4 py-3 border-b border-(--rule) grid grid-cols-1 gap-1.5">
        {ARTIFACT_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onGenerate(type)}
            disabled={!hasSources || generatingType !== null}
            className="flex items-center gap-2.5 rounded-sm border border-(--rule) px-3 py-2 text-sm hover:bg-(--card-stock)/40 hover:border-(--binding-soft) disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {generatingType === type ? (
              <Loader2 size={14} className="text-(--binding) animate-spin" />
            ) : (
              <Icon size={14} className="text-(--binding)" strokeWidth={1.75} />
            )}
            <span>
              {generatingType === type
                ? `Generating ${label.toLowerCase()}…`
                : label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll px-4 py-3 space-y-2.5">
        {loading && (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 rounded bg-(--card-stock)/40 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && artifacts.length === 0 && (
          <div className="text-center py-8 px-2">
            <Sparkles
              size={22}
              className="text-(--binding-soft) mx-auto mb-2"
              strokeWidth={1.5}
            />
            <p className="text-sm text-(--ink-soft)">
              {hasSources
                ? "Generate a summary, study guide, or other notes from your sources."
                : "Add a source to generate notes."}
            </p>
          </div>
        )}

        {!loading &&
          artifacts.map((art) => {
            const isOpen = expanded === art.id;
            return (
              <div
                key={art.id}
                className="rounded-sm border border-(--card-stock-line) bg-(--card-stock)"
              >
                <div className="w-full flex items-center justify-between gap-2 px-3 py-2.5">
                  <button
                    onClick={() => setExpanded(isOpen ? null : art.id)}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <p className="text-sm font-medium leading-tight truncate">
                      {art.title}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-(--binding)">
                      {ARTIFACT_LABEL[art.type]}
                    </span>
                  </button>
                  <button
                    onClick={() => onDelete(art.id)}
                    className="shrink-0 text-(--ink-soft) hover:text-(--highlight) cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {isOpen && (
                  <div className="px-3 pb-3 text-sm leading-relaxed text-(--ink-soft) whitespace-pre-line border-t border-(--card-stock-line) pt-2.5">
                    {art.content}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
