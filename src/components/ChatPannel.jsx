import { useEffect, useRef, useState } from "react";
import {
  Send,
  BookMarked,
  FileText,
  X,
  PaperclipIcon,
  CircleHelp,
  Columns3,
} from "lucide-react";
import { PdfPreview } from "./PDFCard";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

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
  open,
  sourcesOpen,
  setSourcesOpen,
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const textareaRef = useRef(null);

  console.log("Files: ", files);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    setIsAnimated(false);
    const timer = setTimeout(() => setIsAnimated(true), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  // Close PDF preview on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setPreviewPdfUrl(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function submit() {
    if (!input.trim() || sending) return;
    onSend(input.trim(), files);
    setInput("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  function handleAddFileClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = null;
  }

  function handleDrop(e) {
    e.preventDefault();
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex items-center px-4 py-2 shrink-0">
        <button
          onClick={() => setSourcesOpen((open) => !open)}
          className={`w-8 h-8 rounded-sm border border-(--rule) items-center justify-center hover:bg-(--card-stock)/50 transition-colors shrink-0 ${
            sourcesOpen ? "flex lg:hidden" : "flex"
          }`}
          title="Toggle sources"
          aria-label="Toggle sources"
          aria-pressed={sourcesOpen}
        >
          <Columns3 size={15} />
        </button>
      </div>

      {/* HITL / off-topic card */}
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

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto thin-scroll py-6">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Loading skeletons */}
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

          {/* Empty state */}
          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <BookMarked
                size={28}
                className="text-(--binding-soft) mb-3"
                strokeWidth={1.5}
              />
              <p className="font-(family-name:--font-display) text-xl mb-1">
                Nothing written yet
              </p>
              <p className="text-sm text-(--ink-soft) max-w-xs leading-relaxed">
                {hasSources
                  ? "Ask a question about your sources and the answer will appear here."
                  : "Add a source first, then ask a question about it."}
              </p>
            </div>
          )}

          {/* Messages */}
          {!loading &&
            messages.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : ""}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[75%] flex flex-col items-end"
                      : "w-full"
                  }
                >
                  {/* Assistant label */}
                  {m.role === "assistant" && (
                    <div className="font-mono text-[10px] uppercase tracking-wide text-(--binding) mb-2">
                      Answer
                    </div>
                  )}

                  {/* File attachments in message */}
                  {m.role === "user" && m.file_url && (
                    <div className="flex flex-wrap gap-2 mb-2 justify-end">
                      {[m.file_url].map((fileUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setPreviewPdfUrl(fileUrl)}
                          className="w-28 h-28 rounded-sm overflow-hidden border border-(--card-stock-line) bg-(--card-stock) cursor-pointer hover:border-(--binding-soft) transition-colors"
                          title="Preview PDF"
                        >
                          <PdfPreview file_url={fileUrl} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={
                      m.role === "user"
                        ? "rounded-sm bg-(--ink) text-(--paper) px-4 py-2.5 text-base leading-relaxed inline-block"
                        : "text-base leading-relaxed text-(--ink) w-full"
                    }
                  >
                    {m.role === "user" ? (
                      m.content
                    ) : (
                      <Markdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-3 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 mb-3 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 mb-3 space-y-1">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-(--ink)">
                              {children}
                            </strong>
                          ),
                          h1: ({ children }) => (
                            <h1 className="font-(family-name:--font-display) text-xl font-semibold mb-2 mt-4">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="font-(family-name:--font-display) text-lg font-semibold mb-2 mt-3">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="font-semibold mb-1 mt-2">
                              {children}
                            </h3>
                          ),
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            const match = /language-(\w+)/.exec(
                              className || "",
                            );
                            return !inline && match ? (
                              <SyntaxHighlighter
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                  background: "var(--code-bg)",
                                  borderRadius: "2px",
                                  padding: "12px",
                                  fontSize: "13px",
                                  marginBottom: "12px",
                                  fontFamily: "monospace",
                                }}
                                codeTagProps={{
                                  style: { fontFamily: "inherit" },
                                }}
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code
                                className="font-mono text-sm bg-(--code-bg) px-1.5 py-0.5 rounded"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => (
                            <pre className="font-mono text-sm bg-(--code-bg) rounded-sm p-3 mb-3 overflow-x-auto">
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-(--binding-soft) pl-3 text-(--ink-soft) italic mb-3">
                              {children}
                            </blockquote>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-(--binding) underline hover:text-(--highlight)"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {m.content}
                      </Markdown>
                    )}
                  </div>

                  {/* Citations */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.citations.map((c) => (
                        <span
                          key={`${m.id}-${c.index}`}
                          title={c.snippet}
                          className="inline-flex items-center gap-1 font-mono text-[10px] rounded-sm border border-(--card-stock-line) bg-(--card-stock) px-1.5 py-0.5 text-(--ink-soft) cursor-help"
                        >
                          <span className="text-(--highlight)">
                            [{c.index}]
                          </span>
                          {c.sourceTitle?.length > 28
                            ? c.sourceTitle.slice(0, 28) + "…"
                            : c.sourceTitle}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* Sending indicator */}
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
      </div>

      {/* PDF fullscreen preview modal */}
      {previewPdfUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8"
          onClick={() => setPreviewPdfUrl(null)}
        >
          <div
            className="relative w-[min(92vw,820px)] h-[min(82vh,720px)] rounded-sm border border-(--rule) bg-(--paper-raised) shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPdfUrl(null)}
              className="absolute right-3 top-3 z-10 w-8 h-8 rounded-sm bg-(--ink) text-(--paper) flex items-center justify-center hover:bg-(--binding) cursor-pointer transition-colors"
              title="Close preview"
            >
              <X size={14} />
            </button>
            <div className="h-full overflow-auto p-4">
              <PdfPreview file_url={previewPdfUrl} scale={1.4} />
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="px-4 py-3"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col rounded-2xl border border-(--rule) bg-(--paper-raised) focus-within:border-(--binding-soft) transition-colors">
            {/* File previews in input */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pt-3">
                {files.map((file, index) => {
                  const ext = file.name.split(".").pop()?.toLowerCase();
                  const isImage = [
                    "jpg",
                    "jpeg",
                    "png",
                    "gif",
                    "webp",
                  ].includes(ext);
                  const preview = isImage ? URL.createObjectURL(file) : null;

                  return (
                    <div
                      key={index}
                      className="relative group w-20 h-20 rounded-sm border border-(--card-stock-line) bg-(--card-stock) overflow-hidden shrink-0"
                    >
                      {isImage ? (
                        <img
                          src={preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
                          <FileText
                            size={20}
                            className="text-(--binding)"
                            strokeWidth={1.5}
                          />
                          <span className="font-mono text-[9px] text-(--ink-soft) text-center leading-tight line-clamp-2 break-all">
                            {file.name}
                          </span>
                          <span className="font-mono text-[8px] text-(--binding-soft) uppercase">
                            {ext}
                          </span>
                        </div>
                      )}
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

            {/* Input row */}
            <div className="flex items-center gap-2 px-5 py-2 rounded-3xl">
              <button
                onClick={handleAddFileClick}
                className="shrink-0 w-7 h-7 rounded-sm bg-(--ink) text-(--paper) flex items-center justify-center hover:bg-(--binding) cursor-pointer transition-colors"
                title="Attach file"
              >
                <PaperclipIcon size={13} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                style={{ display: "none" }}
              />
              <textarea
                ref={textareaRef}
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
                style={{ maxHeight: "160px", overflowY: "auto" }}
                className="flex-1 resize-none bg-transparent text-base py-1 leading-6 focus:outline-none disabled:cursor-not-allowed placeholder:text-(--ink-soft)"
              />
              <button
                onClick={submit}
                disabled={!input.trim() || sending || !hasSources}
                className="shrink-0 w-7 h-7 rounded-sm bg-(--ink) text-(--paper) flex items-center justify-center hover:bg-(--binding) disabled:opacity-40 cursor-pointer transition-colors self-end"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
          <p className="text-xs text-center text-(--ink-soft) mt-2">
            Marginal is AI and can make mistakes. Please double-check responses.
          </p>
        </div>
      </div>
    </div>
  );
}
