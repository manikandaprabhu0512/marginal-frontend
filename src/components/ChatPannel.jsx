import { useEffect, useRef, useState } from "react";
import {
  Send,
  BookMarked,
  FileText,
  X,
  PaperclipIcon,
  CircleHelp,
} from "lucide-react";
import { PdfPreview } from "./PDFCard";

export default function ChatPanel({
  messages,
  loading,
  sending,
  status,
  hasSources,
  hitlQuestion,
  onHITLQuestion,
  onDismissQuestion,
  onSend,
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [status]);

  function submit() {
    if (!input.trim() || sending) return;
    onSend(input.trim(), files);
    setInput("");
    setFiles([]);
  }

  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  const handleAddFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    setFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative flex flex-col h-full">
      <div className="px-5 py-3 border-b border-(--rule)">
        <h2 className="font-(family-name:--font-display) text-base">
          Notebook page
        </h2>
        <p className="text-xs text-(--ink-soft) mt-0.5">
          Ask questions grounded in your sources.
        </p>
      </div>

      {hitlQuestion && (
        <div className="absolute left-1/2 top-20 z-40 w-[min(92%,440px)] -translate-x-1/2 rounded-sm border border-(--binding-soft) bg-(--paper-raised) shadow-xl">
          <div className="flex items-start gap-3 px-4 py-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-(--card-stock) text-(--binding)">
              <CircleHelp size={15} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] uppercase tracking-wide text-(--binding) mb-1">
                {hitlQuestion.type === "off_topic"
                  ? "Outside notebook"
                  : "Need your input"}
              </div>
              <p className="text-sm leading-relaxed text-(--ink)">
                {hitlQuestion.message}
              </p>
              {hitlQuestion.topic && (
                <p className="mt-2 rounded-sm bg-(--card-stock)/60 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-(--ink-soft)">
                  {hitlQuestion.topic}
                </p>
              )}
            </div>
            {onDismissQuestion && (
              <button
                onClick={onDismissQuestion}
                className="shrink-0 text-(--ink-soft) hover:text-(--ink) cursor-pointer"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-(--rule) px-4 py-3">
            {(hitlQuestion.actions?.length
              ? hitlQuestion.actions
              : [
                  {
                    id: "continue_general",
                    label: "Continue with General Knowledge",
                  },
                ]
            ).map((action) => (
              <button
                key={action.id}
                onClick={() => onHITLQuestion?.(action)}
                className="rounded-sm border border-(--rule) bg-(--paper) px-3 py-1.5 text-sm hover:border-(--binding-soft) hover:bg-(--card-stock)/50 cursor-pointer transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto thin-scroll ruled-bg px-6 py-5 space-y-5"
      >
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded bg-(--card-stock)/40 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <BookMarked
              size={28}
              className="text-(--binding-soft) mb-3"
              strokeWidth={1.5}
            />
            <p className="font-(family-name:--font-display) text-lg mb-1">
              Nothing written yet
            </p>
            <p className="text-sm text-(--ink-soft) max-w-xs">
              {hasSources
                ? "Ask a question about your sources and the answer will appear here, with citations."
                : "Add a source first, then ask a question about it."}
            </p>
          </div>
        )}

        {!loading &&
          messages.map((m) => (
            <div
              key={m.id}
              className={m.role === "user" ? "flex justify-end" : ""}
            >
              <div
                className={m.role === "user" ? "max-w-[85%]" : "max-w-[90%]"}
              >
                {m.role === "assistant" && (
                  <div className="font-mono text-[10px] uppercase tracking-wide text-(--binding) mb-1.5">
                    Answer
                  </div>
                )}

                {m.role === "user" && m.files && m.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 justify-end">
                    {m.files.map((file, index) => {
                      const ext = file.name?.split(".").pop()?.toLowerCase();
                      const isImage = [
                        "jpg",
                        "jpeg",
                        "png",
                        "gif",
                        "webp",
                      ].includes(ext);

                      return (
                        <div key={index}>
                          {isImage ? (
                            // Images — show actual preview
                            <div className="w-32 h-32 rounded-sm overflow-hidden border border-(--card-stock-line)">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : ext === "pdf" ? (
                            // PDF — canvas preview
                            <div className="w-32 h-32 rounded-sm overflow-hidden border border-(--card-stock-line) bg-(--card-stock)">
                              <PdfPreview file={file} />
                            </div>
                          ) : (
                            // Other docs — clean card with icon
                            <div className="flex items-center gap-2.5 rounded-sm border border-(--card-stock-line) bg-(--card-stock) px-3 py-2.5 max-w-50">
                              <div className="w-8 h-8 rounded-sm bg-(--paper-raised) border border-(--rule) flex items-center justify-center shrink-0">
                                <FileText
                                  size={16}
                                  className="text-(--binding)"
                                  strokeWidth={1.5}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-(--ink) truncate leading-tight">
                                  {file.name}
                                </p>
                                <p className="font-mono text-[10px] text-(--ink-soft) uppercase mt-0.5">
                                  {ext}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  className={
                    m.role === "user"
                      ? "rounded-sm bg-(--ink) text-(--paper) px-4 py-2.5 text-sm leading-relaxed"
                      : "text-sm leading-relaxed text-(--ink)"
                  }
                >
                  {m.content}
                </div>
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {m.citations.map((c) => (
                      <span
                        key={`${m.id}-${c.index}`}
                        title={c.snippet}
                        className="inline-flex items-center gap-1 font-mono text-[10px] rounded-sm border border-(--card-stock-line) bg-(--card-stock) px-1.5 py-0.5 text-(--ink-soft) cursor-help"
                      >
                        <span className="text-(--highlight)">[{c.index}]</span>
                        {c.sourceTitle.length > 28
                          ? c.sourceTitle.slice(0, 28) + "…"
                          : c.sourceTitle}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

        {sending && (
          <div>
            <div className="relative h-5 overflow-hidden mb-1.5">
              <div
                key={status}
                className={`font-mono text-[10px] tracking-wide text-(--binding) ${
                  isAnimated ? "animate-fade-loop" : "animate-slide-up"
                }`}
              >
                {status}
              </div>
            </div>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-(--binding-soft) animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-(--binding-soft) animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-(--binding-soft) animate-bounce" />
            </div>
          </div>
        )}
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-t border-(--rule) p-3"
      >
        <div className="flex flex-col rounded-sm border border-(--rule) bg-(--paper-raised) focus-within:border-(--binding-soft) transition-colors">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-2">
              {files.map((file, index) => {
                const ext = file.name.split(".").pop()?.toLowerCase();
                const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
                  ext,
                );
                const preview = isImage ? URL.createObjectURL(file) : null;

                return (
                  <div
                    key={index}
                    className="relative group w-24 h-24 rounded-sm border border-(--card-stock-line) bg-(--card-stock) overflow-hidden shrink-0"
                  >
                    {/* preview */}
                    {isImage ? (
                      <img
                        src={preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
                        <FileText
                          size={22}
                          className="text-(--binding)"
                          strokeWidth={1.5}
                        />
                        <span className="font-mono text-[10px] text-(--ink-soft) text-center leading-tight line-clamp-2 break-all">
                          {file.name}
                        </span>
                        <span className="font-mono text-[9px] text-(--binding-soft) uppercase">
                          {ext}
                        </span>
                      </div>
                    )}

                    {/* remove button */}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-(--ink) text-(--paper) flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* input row */}
          <div className="flex items-end gap-2 px-3 py-2">
            <button
              onClick={handleAddFileClick}
              className="shrink-0 w-8 h-8 rounded-sm bg-(--ink) text-(--paper) flex items-center justify-center hover:bg-(--binding) disabled:opacity-40 cursor-pointer transition-colors"
            >
              <PaperclipIcon size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              style={{ display: "none" }}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={
                hasSources
                  ? "Ask something about your sources…"
                  : "Add a source to start asking questions…"
              }
              disabled={!hasSources}
              rows={1}
              onInput={(e) => autoResize(e.target)}
              className="flex-1 resize-none bg-transparent text-sm align-middle h-6 focus:outline-none disabled:cursor-not-allowed placeholder:text-(--ink-soft)"
            />
            <button
              onClick={submit}
              disabled={!input.trim() || sending || !hasSources}
              className="shrink-0 w-8 h-8 rounded-sm bg-(--ink) text-(--paper) flex items-center justify-center hover:bg-(--binding) disabled:opacity-40 cursor-pointer transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
