import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef } from "react";

export function PdfPreview({ file_url, scale = 0.5 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!file_url) return;

    let renderTask = null;
    let cancelled = false;

    const renderPdf = async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

      const pdf = await pdfjsLib.getDocument({ url: file_url }).promise;
      if (cancelled) return;

      const page = await pdf.getPage(1);
      if (cancelled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      renderTask = page.render({
        canvasContext: canvas.getContext("2d"),
        viewport,
      });
      await renderTask.promise;
    };

    renderPdf();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [file_url, scale]);

  return <canvas ref={canvasRef} className="w-full h-full object-cover" />;
}
