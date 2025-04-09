// src/features/invoices/InvoiceUploadSection.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, CardHeader, CardBody, Button
} from '../../shared';
import { InvoiceForm } from './';
import { FileMetadata } from './components/types';

// Import refactored components
import FileUploadArea from './components/FileUploadArea';
import SelectedFilesList from './components/SelectedFilesList';
import FileMetadataModal from './components/FileMetadataModal';
import UploadOptions from './components/UploadOptions';
import UploadStatus from './components/UploadStatus';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface InvoiceUploadSectionProps {
  availableCategories: string[];
  availableTags: string[];
  onUploadSuccess: () => void;
  showManualEntry: boolean;
  toggleManualEntry: () => void;
  showUploadSection: boolean;
  toggleUploadSection: () => void;
  wideMode?: boolean;
}

const InvoiceUploadSection: React.FC<InvoiceUploadSectionProps> = ({
  availableCategories,
  availableTags,
  onUploadSuccess,
  showManualEntry,
  toggleManualEntry,
  showUploadSection,
  toggleUploadSection,
  wideMode = true
}) => {
  // State for file upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadResults, setUploadResults] = useState<{ success: string[]; failed: string[] }>({ success: [], failed: [] });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadDebug, setUploadDebug] = useState<string | null>(null);
  
  // State for OCR template toggle and debug
  const [useOcrTemplates, setUseOcrTemplates] = useState(true);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [usedTemplateInfo, setUsedTemplateInfo] = useState<string | null>(null);

  // State for batch metadata management
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fileMetadata, setFileMetadata] = useState<{[filename: string]: FileMetadata}>({});
  const [applyToAll, setApplyToAll] = useState(false);
  const [editingFile, setEditingFile] = useState<string | null>(null);

  // Update file metadata when selectedFiles changes
  useEffect(() => {
    // Initialize metadata for new files
    const updatedMetadata = { ...fileMetadata };
    
    selectedFiles.forEach(file => {
      if (!updatedMetadata[file.name]) {
        updatedMetadata[file.name] = { 
          category: '', 
          tags: [] 
        };
      }
    });
    
    // Clean up metadata for removed files
    const selectedFileNames = selectedFiles.map(f => f.name);
    Object.keys(updatedMetadata).forEach(filename => {
      if (!selectedFileNames.includes(filename)) {
        delete updatedMetadata[filename];
      }
    });
    
    setFileMetadata(updatedMetadata);
  }, [selectedFiles, fileMetadata]);

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle files selected in FileUploadArea
  const handleFilesSelected = (newFiles: File[]): void => {
    // Check file sizes and filter out files that are too large
    const validFiles: File[] = [];
    const oversizedFiles: File[] = [];
    
    newFiles.forEach(file => {
      if (file.size <= MAX_FILE_SIZE) {
        validFiles.push(file);
      } else {
        oversizedFiles.push(file);
      }
    });
    
    // Add valid files to selectedFiles
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    
    // Log debug information
    let debugMsg = `Selected ${newFiles.length} file(s):\n`;
    debugMsg += validFiles.map(f => `- ${f.name} (${formatFileSize(f.size)})`).join('\n');
    
    // Add warning for oversized files
    if (oversizedFiles.length > 0) {
      setUploadError(`${oversizedFiles.length} file(s) exceed the maximum size limit of ${formatFileSize(MAX_FILE_SIZE)} and were skipped.`);
      debugMsg += '\n\nSkipped oversized files:\n';
      debugMsg += oversizedFiles.map(f => `- ${f.name} (${formatFileSize(f.size)})`).join('\n');
    }
    
    setUploadDebug(debugMsg);
    
    // Reset upload results
    setUploadResults({ success: [], failed: [] });
  };
  
  // Remove a file from the selected files
  const removeFile = (index: number): void => {
    const file = selectedFiles[index];
    
    // Don't allow removal if file has been successfully uploaded
    if (uploadResults.success.includes(file.name)) {
      setUploadError(`The file "${file.name}" has already been uploaded and cannot be removed.`);
      return;
    }
    
    // Don't allow removal if file is currently uploading
    if (isUploading && uploadProgress[file.name] !== undefined) {
      setUploadError(`The file "${file.name}" is currently being uploaded and cannot be removed.`);
      return;
    }
    
    // Otherwise, proceed with removal
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Also clean up any associated data
    if (uploadProgress[file.name]) {
      setUploadProgress(prev => {
        const updated = {...prev};
        delete updated[file.name];
        return updated;
      });
    }
  };
  
  // Open metadata modal for a specific file
  const openMetadataModal = (filename: string): void => {
    setEditingFile(filename);
    setSelectedCategory(fileMetadata[filename]?.category || '');
    setSelectedTags(fileMetadata[filename]?.tags || []);
    setShowMetadataModal(true);
  };
  
  // Open metadata modal for batch editing
  const openBatchMetadataModal = (): void => {
    setEditingFile(null);
    setSelectedCategory('');
    setSelectedTags([]);
    setApplyToAll(true);
    setShowMetadataModal(true);
  };
  
  // Save metadata changes
  const saveMetadata = (): void => {
    if (editingFile) {
      // Update single file
      setFileMetadata(prev => ({
        ...prev,
        [editingFile]: {
          category: selectedCategory,
          tags: selectedTags
        }
      }));
    } else if (applyToAll) {
      // Update all files
      const updatedMetadata = { ...fileMetadata };
      
      selectedFiles.forEach(file => {
        updatedMetadata[file.name] = {
          category: selectedCategory,
          tags: selectedTags
        };
      });
      
      setFileMetadata(updatedMetadata);
    }
    
    setShowMetadataModal(false);
    setEditingFile(null);
    setApplyToAll(false);
  };
  
  // Upload all selected files
  const handleUploadAll = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      setUploadError("Please select files to upload");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadResults({ success: [], failed: [] });
    setUploadDebug(`Starting upload of ${selectedFiles.length} file(s)...`);
    
    const successfulUploads: string[] = [];
    const failedUploads: string[] = [];
    
    // Process files sequentially
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadDebug(prev => prev ? `${prev}\nUploading file ${i+1}/${selectedFiles.length}: ${file.name}` : "");
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("use_templates", useOcrTemplates.toString());
        
        // Add metadata to the upload
        const metadata = fileMetadata[file.name];
        if (metadata) {
          if (metadata.category) {
            formData.append("category", metadata.category);
          }
          
          if (metadata.tags && metadata.tags.length > 0) {
            // Append each tag individually
            metadata.tags.forEach(tag => {
              formData.append("tags", tag);
            });
          }
        }
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));
        
        try {
          const response = await fetch(`${API_URL}/upload/`, {
            method: 'POST',
            body: formData,
          });
          
          setUploadDebug(prev => prev ? `${prev}\n- Response status: ${response.status}` : "");
          
          if (response.ok) {
            const data = await response.json();
            
            // Store template information if available
            if (data.template_used) {
              setUsedTemplateInfo(prev => {
                const newInfo = prev ? `${prev}\n${file.name}: Used template "${data.template_used}"` : 
                  `${file.name}: Used template "${data.template_used}"`;
                return newInfo;
              });
            } else {
              setUsedTemplateInfo(prev => {
                const newInfo = prev ? `${prev}\n${file.name}: No template matched` : 
                  `${file.name}: No template matched`;
                return newInfo;
              });
            }
            
            setUploadDebug(prev => prev ? `${prev}\n- Upload successful` : "");
            successfulUploads.push(file.name);
            // Update progress to 100%
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 100
            }));
          } else {
            const errorText = await response.text();
            setUploadDebug(prev => prev ? `${prev}\n- Upload failed: ${response.status} ${response.statusText}` : "");
            setUploadDebug(prev => prev ? `${prev}\n- Error response: ${errorText}` : "");
            failedUploads.push(file.name);
            
            // Handle specific errors
            if (response.status === 413) {
              setUploadError("File size too large. The server has a size limit on uploads. Try reducing the file size or using the manual entry form.");
            }
          }
        } catch (fetchError) {
          console.error(`Error uploading ${file.name}:`, fetchError);
          setUploadDebug(prev => prev ? `${prev}\n- Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}` : "");
          failedUploads.push(file.name);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        setUploadDebug(prev => prev ? `${prev}\n- Processing error: ${error instanceof Error ? error.message : String(error)}` : "");
        failedUploads.push(file.name);
      }
    }
    
    // Update final results
    setUploadResults({
      success: successfulUploads,
      failed: failedUploads
    });
    
    // Final summary
    setUploadDebug(prev => prev ? `${prev}\n\nUpload complete: ${successfulUploads.length} successful, ${failedUploads.length} failed` : "");
    
    // Notify parent component of success
    if (successfulUploads.length > 0) {
      onUploadSuccess();
    }
    
    setIsUploading(false);
  };
  
  // Clear all selected files - don't clear already uploaded files
  const handleClearFiles = (): void => {
    // Don't clear files that have been uploaded
    const successfullyUploadedFiles = uploadResults.success;
    if (successfullyUploadedFiles.length > 0) {
      // Filter out successfully uploaded files from clearing
      setSelectedFiles(prevFiles => 
        prevFiles.filter(file => successfullyUploadedFiles.includes(file.name))
      );
      
      setUploadError("Only non-uploaded files have been cleared.");
    } else {
      setSelectedFiles([]);
    }
    
    // Clean up other states
    setUploadProgress({});
    setUploadResults(prev => ({
      success: prev.success,
      failed: []
    }));
    setUploadDebug(null);
    
    // Clean file metadata for non-uploaded files
    setFileMetadata(prev => {
      const updatedMetadata = { ...prev };
      Object.keys(updatedMetadata).forEach(filename => {
        if (!successfullyUploadedFiles.includes(filename)) {
          delete updatedMetadata[filename];
        }
      });
      return updatedMetadata;
    });
  };

  const handleFormSuccess = (): void => {
    toggleManualEntry();
    onUploadSuccess();
  };

  return (
    <Card className={wideMode ? 'w-full' : 'max-w-screen-xl mx-auto'}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Upload Invoices</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={toggleUploadSection}
            >
              <div className="flex items-center">
                {showUploadSection ? 'Hide Upload' : 'Show Upload'}
              </div>
            </Button>
            <Button 
              variant={showManualEntry ? "secondary" : "primary"}
              onClick={toggleManualEntry}
            >
              {showManualEntry ? "Hide Manual Entry" : "Add Invoice Manually"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {(showUploadSection || showManualEntry) && (
        <CardBody>
          {showManualEntry ? (
            <InvoiceForm 
              onSuccess={handleFormSuccess}
              availableCategories={availableCategories}
              availableTags={availableTags}
            />
          ) : showUploadSection ? (
            <div className="py-6">
              {/* File upload area component */}
              <FileUploadArea 
                onFilesSelected={handleFilesSelected}
                maxFileSize={MAX_FILE_SIZE}
                formatFileSize={formatFileSize}
              />
              
              {/* Selected files list component */}
              <SelectedFilesList
                files={selectedFiles}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                uploadResults={uploadResults}
                fileMetadata={fileMetadata}
                formatFileSize={formatFileSize}
                onRemoveFile={removeFile}
                onEditMetadata={openMetadataModal}
                onBatchEditMetadata={openBatchMetadataModal}
                onClearFiles={handleClearFiles}
                onUploadAll={handleUploadAll}
              />
              
              {/* Upload options component */}
              <UploadOptions
                useOcrTemplates={useOcrTemplates}
                setUseOcrTemplates={setUseOcrTemplates}
                showDebugInfo={showDebugInfo}
                setShowDebugInfo={setShowDebugInfo}
              />
              
              {/* Upload status component */}
              <UploadStatus
                isUploading={isUploading}
                uploadError={uploadError}
                uploadDebug={uploadDebug}
                usedTemplateInfo={usedTemplateInfo}
                uploadResults={uploadResults}
                showDebugInfo={showDebugInfo}
                selectedFiles={selectedFiles}
              />
            </div>
          ) : null}
        </CardBody>
      )}

      {/* File metadata modal */}
      <FileMetadataModal
        isOpen={showMetadataModal}
        onClose={() => setShowMetadataModal(false)}
        fileName={editingFile}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableCategories={availableCategories}
        availableTags={availableTags}
        onSave={saveMetadata}
        applyToAll={applyToAll}
        setApplyToAll={setApplyToAll}
      />
    </Card>
  );
};

export default InvoiceUploadSection;