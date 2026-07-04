import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import { createNotebook, listNotebooks } from "../components/NotebookAPI";

function formatRelative(iso) {
  const diff = Date.now() - +new Date(iso);
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listNotebooks().then(setNotebooks);
  }, []);

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    try {
      const nb = await createNotebook("Untitled Notebook");
      navigate(`/${nb.conversation_id}`);
    } catch {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen paper-texture">
      {/* Header */}
      <header className="border-b border-(--rule)">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm border border-(--binding) flex items-center justify-center bg-(--paper-raised) -rotate-2">
              <BookOpen
                size={18}
                strokeWidth={1.75}
                className="text-(--binding)"
              />
            </div>
            <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
              Marginal
            </h1>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-sm bg-(--ink) text-(--paper) px-4 py-2 text-sm font-medium hover:bg-(--binding) disabled:opacity-60 cursor-pointer transition-colors"
          >
            {creating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {creating ? "Creating…" : "New notebook"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="font-(family-name:--font-display) text-3xl mb-1">
            Your notebooks
          </h2>
          <p className="text-sm text-(--ink-soft)">
            Each notebook keeps its sources, conversation, and generated notes
            together.
          </p>
        </div>

        {notebooks === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded border border-(--rule) bg-(--card-stock)/40 animate-pulse"
              />
            ))}
          </div>
        )}

        {notebooks?.length === 0 && (
          <div className="border border-dashed border-(--rule) rounded-sm py-16 text-center">
            <p className="font-(family-name:--font-display) text-xl mb-2">
              No notebooks yet
            </p>
            <p className="text-sm text-(--ink-soft) mb-5">
              Create a notebook to start adding sources and asking questions.
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-sm bg-(--ink) text-(--paper) px-4 py-2 text-sm font-medium hover:bg-(--binding) disabled:opacity-60 cursor-pointer transition-colors"
            >
              {creating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {creating ? "Creating…" : "New notebook"}
            </button>
          </div>
        )}

        {notebooks && notebooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notebooks.map((nb) => (
              <Link
                key={nb.conversation_id}
                to={`/${nb.conversation_id}`}
                className="group block rounded-sm border border-(--rule) bg-(--paper-raised) p-5 hover:border-(--binding-soft) hover:shadow-[0_2px_12px_rgba(139,111,71,0.08)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* <span className="text-2xl">{nb.emoji}</span> */}
                  <span className="font-mono text-[11px] text-(--ink-soft)">
                    {formatRelative(nb.created_at)}
                  </span>
                </div>
                <h3 className="font-(family-name:--font-display) text-xl mb-3 group-hover:text-(--binding) transition-colors">
                  {nb.title}
                </h3>
                <div className="font-mono text-[11px] text-(--binding) uppercase tracking-wide">
                  {nb.source_count} source{nb.source_count === 1 ? "" : "s"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
