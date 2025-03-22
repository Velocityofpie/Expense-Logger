// src/components/invoice/upload/InvoiceUploader.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileList } from './FileList';
import Button from '../../../components/common/Button';

interface InvoiceUploaderProps {
  onUpload: (files: File[], useTemplates: boolean) => Promise<void>;
  isUploading: boolean;
}

export const InvoiceUploader: React.FC<InvoiceUploaderProps> = ({ 
  onUpload, 
  isUploading 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [useTemplates, setUseTemplates] = useState<boolean>(true);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true
  });
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    try {
      await onUpload(files, useTemplates);
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      // Error handling would be implemented here
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Invoices</h2>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
        }`}
      >
        <input {...getInputProps()} />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        
        {isDragActive ? (
          <p className="text-lg text-primary-600 dark:text-primary-400">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Drag and drop your invoice files here, or <span className="text-primary-600 dark:text-primary-400 font-medium">browse</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Supported formats: PDF, JPG, PNG
            </p>
          </div>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="mt-4">
          <FileList files={files} onRemove={removeFile} />
          
          <div className="mt-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useTemplates}
                onChange={() => setUseTemplates(!useTemplates)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Use OCR Templates for extraction
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
              Automatically match invoices to available templates for better data extraction
            </p>
          </div>
          
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={files.length === 0 || isUploading}
              className="w-full justify-center"
            >
              {isUploading 
                ? 'Uploading...' 
                : `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};