import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

export default function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message =
    location.state?.message ||
    searchParams.get("message") ||
    "Something went wrong.";

  return (
    <div className="min-h-screen paper-texture flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-sm border border-(--rule) bg-(--paper-raised) p-6 shadow-xl">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-sm border border-(--rule) bg-(--card-stock)">
          <AlertTriangle size={22} className="text-(--highlight)" />
        </div>
        <h1 className="font-(family-name:--font-display) text-2xl leading-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-(--ink-soft)">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-sm border border-(--rule) px-3 py-2 text-sm hover:bg-(--card-stock)/50 cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} />
            Go back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-sm border border-(--rule) px-3 py-2 text-sm hover:bg-(--card-stock)/50 cursor-pointer transition-colors"
          >
            <RefreshCcw size={14} />
            Retry
          </button>
          <Link
            to="/"
            className="inline-flex items-center rounded-sm bg-(--ink) px-3 py-2 text-sm text-(--paper) hover:bg-(--binding) transition-colors"
          >
            Notebooks
          </Link>
        </div>
      </div>
    </div>
  );
}
