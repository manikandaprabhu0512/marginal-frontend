import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef } from "react";

export function PdfPreview({ file }) {
  const canvasRef = useRef(null);

  console.log("File: ", file);

  useEffect(() => {
    if (!file || !(file instanceof File)) return;

    let renderTask = null;
    let cancelled = false;

    const renderPdf = async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

      const url = URL.createObjectURL(file);

      try {
        const pdf = await pdfjsLib.getDocument({ url }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 0.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
        }).promise;
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    renderPdf();
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [file]);

  return <canvas ref={canvasRef} className="w-full h-full object-cover" />;
}
