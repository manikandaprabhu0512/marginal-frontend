import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import NotebookLM_Dashboard from "./pages/NotebookLM_Dashboard";
import NotebookPage from "./pages/Workspace";
import axios from "axios";

function App() {
  const [isServerStarting, setIsServerStarting] = useState(true);
  const [startupSecondsLeft, setStartupSecondsLeft] = useState(90);

  useEffect(() => {
    if (!isServerStarting) return;

    const timer = window.setInterval(() => {
      setStartupSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isServerStarting]);

  useEffect(() => {
    if (!isServerStarting) return;

    const healthCheck = async () => {
      try {
        const response = await axios.get("/health");

        if (response.status === 200) {
          setIsServerStarting(false);
        }
      } catch (error) {
        console.error("Health check failed:", error);
      }
    };

    healthCheck();

    const intervalId = window.setInterval(healthCheck, 1000);

    return () => window.clearInterval(intervalId);
  }, [isServerStarting]);

  if (isServerStarting) {
    const progress = ((90 - startupSecondsLeft) / 90) * 100;

    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 dark:from-[#030303] dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 text-gray-900 dark:text-gray-100">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-8 border-orange-100 dark:border-slate-800">
            <span className="text-3xl font-bold text-orange-600">
              {startupSecondsLeft}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-3">Starting server</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Render may need a short cold start. Your app will load automatically
            once the backend is ready.
          </p>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-orange-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
            {startupSecondsLeft > 0
              ? "Please keep this tab open."
              : "Still waking up. This can take a little longer sometimes."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<NotebookLM_Dashboard />} />
      <Route path="/:id" element={<NotebookPage />} />
    </Routes>
  );
}

export default App;
