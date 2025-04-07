// src/features/invoices/components/FileUploadArea.tsx
import React from 'react';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  maxFileSize: number;
  formatFileSize: (bytes: number) => string;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFilesSelected,
  maxFileSize,
  formatFileSize
}) => {
  // Handle file selection with multiple file support
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    // Convert FileList to array
    const newFiles = Array.from(e.target.files);
    
    // Pass files to parent component for processing
    onFilesSelected(newFiles);
  };

  return (
    <div className="text-center mb-6">
      <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or click to select files</p>
      <div className="mt-4">
        <input
          type="file"
          className="hidden"
          id="file-upload"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          multiple
        />
        <label
          htmlFor="file-upload"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
        >
          Select Invoice Files
        </label>
        <p className="mt-2 text-xs text-gray-500">Maximum file size: {formatFileSize(maxFileSize)}</p>
      </div>
    </div>
  );
};

export default FileUploadArea;