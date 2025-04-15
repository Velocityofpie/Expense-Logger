// frontend/src/features/tools/exports_imports/hooks/useImport.ts
import { useState, useCallback, useEffect } from 'react';
import { parseFile, applyFieldMapping, validateImportData, processImport } from '../utils/importUtils';
import { detectFileFormat } from '../utils/formatConversions';
import { loadImportTemplate } from '../utils/templates';
import { FileFormat, ImportStage, ImportResult } from '../types';

/**
 * Custom hook for managing the import process
 */
export const useImport = () => {
  // State for the current stage of the import process
  const [stage, setStage] = useState<ImportStage>('upload');

  // File-related state
  const [files, setFiles] = useState<File[]>([]);
  const [fileFormat, setFileFormat] = useState<FileFormat | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  // Mapping and template state
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [template, setTemplate] = useState<any | null>(null);

  // Process state
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load template when selected template ID changes
  useEffect(() => {
    if (selectedTemplateId) {
      const loadTemplate = async () => {
        try {
          const templateData = await loadImportTemplate(selectedTemplateId);
          setTemplate(templateData);
          
          // If we have template and preview data, apply the template's field mapping
          if (templateData && previewData) {
            setFieldMapping(templateData.fieldMapping);
          }
        } catch (err) {
          setError('Failed to load template');
          console.error('Template loading error:', err);
        }
      };
      
      loadTemplate();
    } else {
      setTemplate(null);
    }
  }, [selectedTemplateId, previewData]);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async (selectedFiles: File[]) => {
    if (!selectedFiles.length) return;
    
    try {
      setFiles(selectedFiles);
      setError(null);
      
      // Detect file format of the first file
      const format = await detectFileFormat(selectedFiles[0]);
      setFileFormat(format);
      
      // Parse the file to get preview data
      const data = await parseFile(selectedFiles[0], format);
      setPreviewData(data.slice(0, 10)); // Get first 10 rows for preview
      
      // Move to mapping stage
      setStage('mapping');
    } catch (err) {
      setError(`Failed to read file: ${err instanceof Error ? err.message : String(err)}`);
      console.error('File reading error:', err);
    }
  }, []);

  /**
   * Apply a template to the current data
   */
  const applyTemplate = useCallback(async (templateId: string) => {
    try {
      setSelectedTemplateId(templateId);
      // Template loading is handled in the useEffect
    } catch (err) {
      setError(`Failed to apply template: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Template application error:', err);
    }
  }, []);

  /**
   * Update field mapping
   */
  const updateFieldMapping = useCallback((mapping: Record<string, string>) => {
    setFieldMapping(mapping);
  }, []);

  /**
   * Move to the validation stage
   */
  const validateImport = useCallback(() => {
    if (!previewData || !fieldMapping) {
      setError('Missing data or field mapping');
      return;
    }
    
    try {
      // Apply field mapping to create the mapped data
      const mappedData = applyFieldMapping(previewData, fieldMapping);
      
      // Validate the mapped data
      const validationResult = validateImportData(mappedData);
      setValidationErrors(validationResult.errors);
      
      // Move to the next stage
      setStage('validation');
    } catch (err) {
      setError(`Validation error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Validation error:', err);
    }
  }, [previewData, fieldMapping]);

  /**
   * Start the import process
   */
  const startImport = useCallback(async () => {
    if (!previewData || !fieldMapping || !fileFormat) {
      setError('Missing data, field mapping, or file format');
      return;
    }
    
    try {
      setIsProcessing(true);
      setStage('importing');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 99) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 5; // Increment by a random amount up to 5%
        });
      }, 200);
      
      // Apply field mapping to create the mapped data
      const mappedData = applyFieldMapping(previewData, fieldMapping);
      
      // Process the import (in a real app, this would call an API)
      const result = await processImport(mappedData);
      
      // Clear the interval if it's still running
      clearInterval(progressInterval);
      setImportProgress(100);
      
      // Set the import result
      setImportResult(result);
      
      // Move to the complete stage
      setStage('complete');
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Import error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [previewData, fieldMapping, fileFormat]);

  /**
   * Reset the import process
   */
  const resetImport = useCallback(() => {
    setStage('upload');
    setFiles([]);
    setFileFormat(null);
    setPreviewData(null);
    setFieldMapping({});
    setSelectedTemplateId(null);
    setTemplate(null);
    setImportProgress(0);
    setImportResult(null);
    setIsProcessing(false);
    setError(null);
    setValidationErrors([]);
  }, []);

  /**
   * Cancel the current import process
   */
  const cancelImport = useCallback(() => {
    // If we're in the middle of importing, we'd need to cancel API requests
    // For now, just reset the import process
    resetImport();
  }, [resetImport]);

  return {
    // State
    stage,
    files,
    fileFormat,
    previewData,
    fieldMapping,
    selectedTemplateId,
    template,
    importProgress,
    importResult,
    isProcessing,
    error,
    validationErrors,
    
    // Actions
    handleFileSelect,
    applyTemplate,
    updateFieldMapping,
    validateImport,
    startImport,
    resetImport,
    cancelImport,
    setStage
  };
};

export default useImport;