import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import ePub from "epubjs";

// react-pdf needs a worker; load it from a CDN matching the installed pdfjs-dist version.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Renders a PDF or EPUB given a signed { url, fileType }. Used by both the
// full Reader page (owned books) and the SampleReader page (preview files),
// so the two never drift apart in how they render content.
export default function BookViewer({ url, fileType, downloadable = true }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(720);
  const epubContainerRef = useRef(null);
  const renditionRef = useRef(null);
  const pdfContainerRef = useRef(null);

  useEffect(() => {
    if (fileType !== "epub" || !epubContainerRef.current) return;

    const book = ePub(url);
    const rendition = book.renderTo(epubContainerRef.current, {
      width: "100%",
      height: "100%",
    });
    rendition.display();
    renditionRef.current = rendition;

    return () => book.destroy();
  }, [url, fileType]);

  // Keep the PDF page sized to whatever space its container actually has,
  // instead of a fixed pixel width that looks wrong on different screens.
  useEffect(() => {
    if (!pdfContainerRef.current) return;

    const updateWidth = () => {
      if (pdfContainerRef.current) {
        // Cap at 800px so pages don't stretch too wide on large monitors
        setPageWidth(Math.min(pdfContainerRef.current.clientWidth, 800));
      }
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(pdfContainerRef.current);

    return () => observer.disconnect();
  }, [url]);

  return (
    <div>
      {downloadable && (
        <div className="mb-4 flex justify-end">
          <a
            href={url}
            download
            className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500 hover:text-gold-400"
          >
            Download
          </a>
        </div>
      )}

      {fileType === "pdf" ? (
        <div ref={pdfContainerRef} className="rounded-md bg-navy-900 p-4">
          <div className="flex justify-center overflow-x-auto">
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<p className="text-ivory/50">Loading PDF…</p>}
            >
              <Page pageNumber={pageNumber} width={pageWidth} />
            </Document>
          </div>
          {numPages && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-ivory/50">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
                className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            onClick={() => renditionRef.current?.prev()}
            className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500"
          >
            ← Prev
          </button>
          <div ref={epubContainerRef} className="mx-4 h-[75vh] w-full rounded-md bg-parchment" />
          <button
            onClick={() => renditionRef.current?.next()}
            className="rounded-full border border-navy-700 px-4 py-2 text-sm text-ivory/70 hover:border-gold-500"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}