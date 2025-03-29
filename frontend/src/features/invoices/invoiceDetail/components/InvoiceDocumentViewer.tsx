// src/features/invoices/invoiceDetail/components/InvoiceDocumentViewer.tsx
import React from 'react';

interface InvoiceDocumentViewerProps {
  pdfUrl: string;
}

const InvoiceDocumentViewer: React.FC<InvoiceDocumentViewerProps> = ({ pdfUrl }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Invoice Document</h3>
        {pdfUrl && (
          <a 
            href={`${API_URL}/download/${encodeURIComponent(pdfUrl.split('/').pop() || '')}`}
            className="flex items-center px-3 py-2 border border-blue-500 text-blue-500 text-sm rounded-md hover:bg-blue-50"
            download
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        )}
      </div>
      
      <div className="mt-4">
        {pdfUrl ? (
          <div className="aspect-w-16 aspect-h-9 border rounded-lg overflow-hidden shadow-sm">
            <iframe
              src={pdfUrl}
              title="Invoice PDF"
              className="w-full h-full"
              style={{ height: '800px', backgroundColor: '#f9fafb' }}
            ></iframe>
          </div>
        ) : (
          <div className="text-center p-12 border rounded-lg bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mb-4">No document available for this invoice</p>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDocumentViewer;