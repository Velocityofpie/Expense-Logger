// src/components/invoice/detail/InvoicePdfViewer.tsx
import React from 'react';
import Button from '../../../components/common/Button';

interface InvoicePdfViewerProps {
  pdfUrl: string | null;
  fileName: string | null;
  onDownload: () => void;
}

export const InvoicePdfViewer: React.FC<InvoicePdfViewerProps> = ({
  pdfUrl,
  fileName,
  onDownload
}) => {
  if (!pdfUrl) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-3">No document available for this invoice</p>
          <Button
            variant="outline"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }
          >
            Upload Document
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Invoice Document
          </h3>
          <Button
            variant="outline"
            onClick={onDownload}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Download
          </Button>
        </div>
        {fileName && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {fileName}
          </p>
        )}
      </div>
      <div className="p-0">
        <iframe
          src={pdfUrl}
          title="Invoice PDF"
          className="w-full rounded-b-lg"
          style={{ height: '700px', border: 'none' }}
        />
      </div>
    </div>
  );
};