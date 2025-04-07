// src/features/invoices/components/UploadStatus.tsx
import React from 'react';

interface UploadStatusProps {
  isUploading: boolean;
  uploadError: string | null;
  uploadDebug: string | null;
  usedTemplateInfo: string | null;
  uploadResults: { success: string[]; failed: string[] };
  showDebugInfo: boolean;
  selectedFiles: File[];
}

const UploadStatus: React.FC<UploadStatusProps> = ({
  isUploading,
  uploadError,
  uploadDebug,
  usedTemplateInfo,
  uploadResults,
  showDebugInfo,
  selectedFiles
}) => {
  return (
    <>
      {/* Upload status and debug info */}
      {isUploading && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Uploading {uploadResults.success.length + uploadResults.failed.length} of {selectedFiles.length} files...
          </p>
        </div>
      )}
      
      {uploadError && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded text-sm">
          <div className="font-medium">Error:</div>
          <div>{uploadError}</div>
        </div>
      )}
      
      {/* Debug info - only shown when toggle is enabled */}
      {showDebugInfo && (uploadDebug || usedTemplateInfo) && (
        <div className="mt-4 p-3 bg-gray-100 text-gray-800 rounded text-sm text-left whitespace-pre-wrap overflow-auto max-h-64">
          <div className="font-medium mb-1">Debug Info:</div>
          {uploadDebug}
          
          {/* Display OCR template information */}
          {usedTemplateInfo && (
            <>
              <div className="font-medium mt-3 mb-1">OCR Template Info:</div>
              {usedTemplateInfo}
            </>
          )}
        </div>
      )}
      
      {/* Upload summary */}
      {(uploadResults.success.length > 0 || uploadResults.failed.length > 0) && !isUploading && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700">Upload Summary</h3>
          <div className="flex mt-2">
            <div className="mr-6">
              <span className="text-sm text-gray-500">Successful:</span>
              <span className="ml-2 text-sm font-medium text-green-600">{uploadResults.success.length}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Failed:</span>
              <span className="ml-2 text-sm font-medium text-red-600">{uploadResults.failed.length}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadStatus;