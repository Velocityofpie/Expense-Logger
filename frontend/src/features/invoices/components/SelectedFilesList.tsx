// src/features/invoices/components/SelectedFilesList.tsx
import React from 'react';
import { Button, Badge } from '../../../shared';

interface FileMetadata {
  category: string;
  tags: string[];
}

interface SelectedFilesListProps {
  files: File[];
  isUploading: boolean;
  uploadProgress: { [key: string]: number };
  uploadResults: { success: string[]; failed: string[] };
  fileMetadata: {[filename: string]: FileMetadata};
  formatFileSize: (bytes: number) => string; // Fixed return type from void to string
  onRemoveFile: (index: number) => void;
  onEditMetadata: (filename: string) => void;
  onBatchEditMetadata: () => void;
  onClearFiles: () => void;
  onUploadAll: () => void;
}

const SelectedFilesList: React.FC<SelectedFilesListProps> = ({
  files,
  isUploading,
  uploadProgress,
  uploadResults,
  fileMetadata,
  formatFileSize,
  onRemoveFile,
  onEditMetadata,
  onBatchEditMetadata,
  onClearFiles,
  onUploadAll
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Selected Files ({files.length})</h3>
        <div className="space-x-2">
          {/* Batch metadata button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBatchEditMetadata}
            disabled={isUploading || files.length === 0}
          >
            Add Categories & Tags
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFiles}
            disabled={isUploading}
          >
            Clear All
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onUploadAll}
            disabled={isUploading || files.length === 0}
            isLoading={isUploading}
            loadingText="Uploading..."
          >
            Upload All
          </Button>
        </div>
      </div>
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
          {files.map((file, index) => (
            <li 
              key={`${file.name}-${index}`} 
              className={`px-4 py-3 flex items-center justify-between text-sm ${
                uploadResults.success.includes(file.name) 
                  ? 'bg-green-50' 
                  : uploadResults.failed.includes(file.name) 
                    ? 'bg-red-50' 
                    : ''
              }`}
            >
              <div className="flex items-center flex-grow">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <div className="flex-grow truncate">
                  <span className="truncate">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  
                  {/* Show metadata summary */}
                  {fileMetadata[file.name] && (
                    <div className="mt-1 text-xs text-gray-600">
                      {fileMetadata[file.name].category && (
                        <Badge color="primary" className="mr-1">
                          {fileMetadata[file.name].category}
                        </Badge>
                      )}
                      {fileMetadata[file.name].tags.map(tag => (
                        <Badge key={tag} color="secondary" className="mr-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                {/* Status indicators */}
                {uploadResults.success.includes(file.name) && (
                  <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Uploaded
                  </span>
                )}
                
                {uploadResults.failed.includes(file.name) && (
                  <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Failed
                  </span>
                )}
                
                {/* FIXED: Only show action buttons for files that haven't been uploaded */}
                {!isUploading && !uploadResults.success.includes(file.name) && (
                    <>
                        {/* Add metadata button */}
                        <button 
                        type="button"
                        onClick={() => onEditMetadata(file.name)} 
                        className="text-blue-600 hover:text-blue-900 p-1 mr-1"
                        title="Add metadata"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        </button>
                    
                        {/* Remove file button - only shown for files that haven't been uploaded yet */}
                        <button 
                        type="button"
                        onClick={() => onRemoveFile(index)} 
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Remove file"
                        >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        </button>
                    </>
                    )}

                {isUploading && uploadProgress[file.name] !== undefined && (
                  <div className="ml-2 w-16 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SelectedFilesList;