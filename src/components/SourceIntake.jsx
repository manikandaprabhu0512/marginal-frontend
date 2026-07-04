import { useState } from "react";
import {
  Search,
  Upload,
  Link as LinkIcon,
  FileText,
  Video,
  X,
} from "lucide-react";

export default function AddSourceIntake({ onAddSource, onClose }) {
  const [searchValue, setSearchValue] = useState("");
  const [mode, setMode] = useState(null);
  const [fieldValue, setFieldValue] = useState("");

  function submitSearch() {
    if (!searchValue.trim()) return;
    onAddSource(searchValue.trim());
    setSearchValue("");
  }

  function submitField() {
    if (!fieldValue.trim() || !mode) return;
    const typeMap = {
      url: "url",
      paste: "txt",
      youtube: "youtube",
    };
    onAddSource(fieldValue.trim());
    setFieldValue("");
    setMode(null);
  }

  function handleFileSelect(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const type =
        ext === "pdf"
          ? "pdf"
          : ext === "mp3" || ext === "wav" || ext === "m4a"
            ? "audio"
            : "doc";
      onAddSource(file.name, type);
    });
    e.target.value = "";
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="punch-holes relative bg-(--paper-raised) rounded-sm border border-(--card-stock-line) w-full max-w-xl pl-10 pr-6 py-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-(--ink-soft) hover:text-(--ink) cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-(family-name:--font-display) text-2xl mb-1.5">
            Add your first source
          </h2>
          <p className="text-sm text-(--ink-soft)">
            Upload a document, paste a link, or search the web to get started.
          </p>
        </div>

        {/* Search box */}
        <div className="rounded-sm border border-(--rule) focus-within:border-(--binding) bg-(--paper) px-4 py-3 mb-4 transition-colors">
          <div className="flex items-center gap-2.5">
            <Search size={16} className="text-(--ink-soft) shrink-0" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              placeholder="Search the web for new sources"
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-(--ink-soft)"
            />
            <button
              onClick={submitSearch}
              disabled={!searchValue.trim()}
              className="shrink-0 w-8 h-8 rounded-sm bg-(--ink) text-(--paper) flex items-center justify-center hover:bg-(--binding) disabled:opacity-40 cursor-pointer transition-colors"
            >
              <Search size={14} />
            </button>
          </div>
        </div>

        {/* Drop zone / option pills */}
        <div className="rounded-sm border border-dashed border-(--rule) bg-(--card-stock)/40 px-6 py-8">
          <div className="text-center mb-6">
            <p className="font-(family-name:--font-display) text-lg mb-1">
              or add your files
            </p>
            <p className="text-xs text-[var(--ink-soft)] font-[family-name:var(--font-mono)]">
              pdf, docs, audio, websites, and more
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--rule)] bg-[var(--paper-raised)] px-4 py-2 text-sm hover:border-[var(--binding-soft)] cursor-pointer transition-colors">
              <Upload size={14} className="text-[var(--binding)]" />
              Upload files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.m4a"
              />
            </label>

            <button
              onClick={() => setMode(mode === "url" ? null : "url")}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors cursor-pointer ${
                mode === "url"
                  ? "border-[var(--binding)] bg-[var(--paper-raised)]"
                  : "border-[var(--rule)] bg-[var(--paper-raised)] hover:border-[var(--binding-soft)]"
              }`}
            >
              <LinkIcon size={14} className="text-[var(--binding)]" />
              Website link
            </button>

            <button
              onClick={() => setMode(mode === "paste" ? null : "paste")}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors cursor-pointer ${
                mode === "paste"
                  ? "border-[var(--binding)] bg-[var(--paper-raised)]"
                  : "border-[var(--rule)] bg-[var(--paper-raised)] hover:border-[var(--binding-soft)]"
              }`}
            >
              <FileText size={14} className="text-[var(--binding)]" />
              Paste text
            </button>
          </div>

          {/* Inline field for url / paste / youtube */}
          {mode && mode !== "search" && (
            <div className="mt-5 max-w-md mx-auto">
              {mode === "paste" ? (
                <textarea
                  autoFocus
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder="Paste your text here…"
                  rows={4}
                  className="w-full rounded-sm border border-[var(--rule)] bg-[var(--paper-raised)] px-3 py-2 text-sm mb-2 focus:outline-2 focus:outline-[var(--binding)] resize-none"
                />
              ) : (
                <input
                  autoFocus
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitField()}
                  placeholder={
                    mode === "youtube"
                      ? "YouTube video URL"
                      : "https://example.com/article"
                  }
                  className="w-full rounded-sm border border-(--rule) bg-(--paper-raised) px-3 py-2 text-sm mb-2 focus:outline-2 focus:outline-[var(--binding)]"
                />
              )}
              <button
                onClick={submitField}
                disabled={!fieldValue.trim()}
                className="w-full rounded-sm bg-[var(--ink)] text-[var(--paper)] py-2 text-sm font-medium hover:bg-[var(--binding)] disabled:opacity-50 cursor-pointer transition-colors"
              >
                Add source
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
