// InvoiceUpload.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Checkbox } from '../../shared';
import { uploadInvoice } from './invoicesApi';
import { UploadResult } from './types';

interface InvoiceUploadProps {
  onUploadSuccess: () => void;
}

const InvoiceUpload: React.FC<InvoiceUploadProps> = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [useTemplates, setUseTemplates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handle file selection with multiple file support
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };
  
  // Remove a file from the selected files
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select files to upload.");
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Track upload results
      const results: UploadResult[] = [];
      
      // Upload each file sequentially 
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("use_templates", useTemplates.toString());
        
        console.log("Uploading file:", file.name);
        console.log("Using OCR templates:", useTemplates);
        
        try {
          const result = await uploadInvoice(formData);
          results.push({ 
            success: true, 
            fileName: file.name,
            invoice_id: result.invoice_id
          });
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          results.push({ 
            success: false, 
            fileName: file.name,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      // Reset files state
      setFiles([]);
      
      // Calculate success/failure counts
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      // Show summary of results
      if (failureCount === 0) {
        onUploadSuccess();
      } else {
        setError(`Uploaded ${successCount} file(s), failed to upload ${failureCount} file(s).`);
      }
      
      setIsUploading(false);
    } catch (error) {
      console.error("Error during upload process:", error);
      setError(`Error during upload process: ${error instanceof Error ? error.message : "Please try again."}`);
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Upload Invoice Files</h3>
      </CardHeader>
      <CardBody>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF or Image Files
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md px-6 pt-5 pb-6 cursor-pointer hover:border-primary-500 transition-colors duration-200" onClick={() => document.getElementById('file-upload')?.click()}>
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                    <span>Upload files</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file"
                      multiple
                      className="sr-only"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>
          
          {/* File list with remove buttons */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Selected Files:</h4>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {files.map((file, index) => (
                  <li key={index} className="px-4 py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFile(index)} 
                      className="text-red-600 hover:text-red-900"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Template toggle option */}
          <div className="flex items-center">
            <Checkbox
              id="use-templates"
              checked={useTemplates}
              onChange={(e) => setUseTemplates(e.target.checked)}
            />
            <label htmlFor="use-templates" className="ml-2 block text-sm text-gray-900">
              Use OCR Templates for extraction
            </label>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="primary"
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              isLoading={isUploading}
              loadingText="Uploading..."
            >
              {isUploading ? 'Uploading...' : `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default InvoiceUpload;