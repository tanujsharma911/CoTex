import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ButtonGroup } from '@/components/ui/button-group';
import { MinusIcon, PlusIcon } from 'lucide-react';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Button } from '../ui/button';
import type { docType } from '@cotex/types';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFViewer({
  pdfUrl,
  error
}: {
  pdfUrl: string;
  error: string;
}) {
  const [showTools, setShowTools] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>();
  const [zoom, setZoom] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  if (error) {
    return (
      <div className="h-full overflow-scroll text-zinc-900">
        <pre>{error}</pre>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="text-center my-auto text-zinc-800">
        Generate PDF to view
      </div>
    );
  }

  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setShowTools(true)}
      onMouseLeave={() => setShowTools(false)}
    >
      <div className="overflow-auto h-full">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className={`grid ${zoom < 0.5 ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          {Array.from(new Array(numPages), (_el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              className="my-2 w-fit mx-auto shadow-lg"
              scale={zoom}
            />
          ))}
        </Document>
      </div>
      {showTools && (
        <div className="absolute w-fit z-10 right-2 bottom-2">
          <div>
            <ButtonGroup
              aria-label="Media controls"
              className="h-fit rounded-lg bg-white dark:bg-zinc-600 shadow-lg"
            >
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setZoom((prev) => Math.min(prev + 0.1, 3))}
              >
                <PlusIcon />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.3))}
              >
                <MinusIcon />
              </Button>
            </ButtonGroup>
          </div>
        </div>
      )}
    </div>
  );
}
