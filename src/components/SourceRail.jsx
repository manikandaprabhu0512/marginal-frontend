import { useState } from "react";
import {
  Columns3,
  FileText,
  Link as LinkIcon,
  Mic,
  Video,
  File,
  Trash2,
} from "lucide-react";

const TYPE_ICON = {
  pdf: FileText,
  doc: File,
  txt: File,
  link: LinkIcon,
  audio: Mic,
  youtube: Video,
};

export default function SourceRail({
  sources,
  selectedurls,
  onToggleSelect,
  onAddSource,
  onDeleteSource,
  onToggleRail,
}) {
  const [dragActive, setDragActive] = useState(false);

  function getFileType(fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "txt") return "txt";
    if (["mp3", "wav", "m4a"].includes(ext)) return "audio";
    return "doc";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragActive(true);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      files.forEach((file) => onAddSource(file.name, getFileType(file.name)));
      return;
    }

    const text =
      e.dataTransfer.getData("text/uri-list") ||
      e.dataTransfer.getData("text/plain");
    if (text.trim())
      onAddSource(text.trim(), text.startsWith("http") ? "url" : "txt");
  }

  function handleSourceDragStart(e, src) {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", src.url || src.title);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: src._id,
        title: src.title,
        url: src.url,
        type: src.source_type,
      }),
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--rule)">
        <h2 className="font-(family-name:--font-display) text-base">Sources</h2>
        <button
          onClick={onToggleRail}
          className="w-7 h-7 rounded-sm border border-(--rule) flex items-center justify-center hover:bg-(--card-stock)/50 cursor-pointer transition-colors"
          title="Toggle sources"
          aria-label="Toggle sources"
        >
          <Columns3 size={14} />
        </button>
      </div>

      <div
        onDragEnter={() => setDragActive(true)}
        onDragOver={handleDragOver}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`flex-1 overflow-y-auto thin-scroll px-3 py-3 space-y-2.5 transition-colors ${
          dragActive ? "bg-(--card-stock)/60" : ""
        }`}
      >
        {sources.length === 0 && (
          <div className="text-center py-10 px-2">
            <p className="text-sm text-(--ink-soft) mb-3">
              No sources yet. Add a document, link, or recording to get started.
            </p>
          </div>
        )}

        {sources.map((src, i) => {
          const Icon = TYPE_ICON[src.source_type];
          const checked = selectedurls.has(src.url);
          return (
            <div
              key={src._id}
              draggable
              onDragStart={(e) => handleSourceDragStart(e, src)}
              className="punch-holes relative group rounded-sm border border-(--card-stock-line) bg-(--card-stock) pl-6 pr-3 py-3 hover:border-(--binding-soft) transition-colors cursor-pointer"
            >
              <div className="absolute top-3 left-10 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out z-100 pointer-events-none">
                <div className="mx-3 bg-(--binding) text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg flex items-center justify-between">
                  <span className="w-full">{src.title}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <label className="mt-0.5 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!checked}
                    onChange={() => onToggleSelect(src.url)}
                    className="accent-(--binding) w-3.5 h-3.5 cursor-pointer"
                  />
                </label>
                <Icon
                  size={14}
                  className="mt-0.5 shrink-0 text-(--binding)"
                  strokeWidth={1.75}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug line-clamp-2">
                    {src.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-mono text-[10px] text-(--ink-soft)">
                      №{String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteSource(src._id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-(--ink-soft) hover:text-(--highlight) cursor-pointer"
                  title="Remove source"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
