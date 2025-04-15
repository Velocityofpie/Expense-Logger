// frontend/src/features/tools/exports_imports/hooks/useExport.ts
import { useState, useCallback, useEffect } from 'react';
import { formatDataForExport, filterDataForExport, exportData } from '../utils/exportUtils';
import { loadExportTemplate } from '../utils/templates';
import { FileFormat, ExportStage, ExportResult } from '../types';

/**
 * Custom hook for managing the export process
 */
export const useExport = (initialData: any[] = []) => {
  // State for the current stage of the export process
  const [stage, setStage] = useState<ExportStage>('configure');

  // Export configuration state
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('excel');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [template, setTemplate] = useState<any | null>(null);
  const [includeAttachments, setIncludeAttachments] = useState(false);

  // Process state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [data, setData] = useState<any[]>(initialData);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Load template when selected template ID changes
  useEffect(() => {
    if (selectedTemplateId) {
      const loadTemplate = async () => {
        try {
          const templateData = await loadExportTemplate(selectedTemplateId);
          setTemplate(templateData);
          
          // Apply template settings
          if (templateData) {
            setSelectedFormat(templateData.format);
            setSelectedFields(templateData.includedFields || []);
            
            if (templateData.filters) {
              if (templateData.filters.dateRange) {
                setDateRange(templateData.filters.dateRange);
              }
              if (templateData.filters.categories) {
                setSelectedCategories(templateData.filters.categories);
              }
              if (templateData.filters.tags) {
                setSelectedTags(templateData.filters.tags);
              }
            }
            
            if (templateData.options) {
              setIncludeAttachments(templateData.options.includeAttachments || false);
            }
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
  }, [selectedTemplateId]);

  /**
   * Apply an export template
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
   * Update export format
   */
  const updateFormat = useCallback((format: FileFormat) => {
    setSelectedFormat(format);
  }, []);

  /**
   * Update selected fields
   */
  const updateSelectedFields = useCallback((fields: string[]) => {
    setSelectedFields(fields);
  }, []);

  /**
   * Update date range
   */
  const updateDateRange = useCallback((range: { start: string; end: string }) => {
    setDateRange(range);
  }, []);

  /**
   * Update selected categories
   */
  const updateSelectedCategories = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
  }, []);

  /**
   * Update selected tags
   */
  const updateSelectedTags = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  /**
   * Toggle include attachments option
   */
  const toggleIncludeAttachments = useCallback(() => {
    setIncludeAttachments(prev => !prev);
  }, []);

  /**
   * Start the export process
   */
  const startExport = useCallback(async () => {
    try {
      setIsExporting(true);
      setStage('exporting');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 99) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 10; // Increment by a random amount up to 10%
        });
      }, 100);
      
      // Apply filters
      const filters = {
        dateRange,
        categories: selectedCategories,
        tags: selectedTags
      };
      
      const filteredData = filterDataForExport(data, filters);
      
      // Format the data for export
      const formattedData = formatDataForExport(filteredData, selectedFields);
      
      // Export the data (in a real app, this might call an API)
      const result = await exportData(formattedData, selectedFormat, {
        filename: `export_${new Date().toISOString().split('T')[0]}`,
        includeAttachments
      });
      
      // Clear the interval if it's still running
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // Set the export result
      setExportResult(result);
      
      // Move to the complete stage
      setStage('complete');
    } catch (err) {
      setError(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [data, selectedFormat, selectedFields, dateRange, selectedCategories, selectedTags, includeAttachments]);

  /**
   * Reset the export process
   */
  const resetExport = useCallback(() => {
    setStage('configure');
    setSelectedFormat('excel');
    setSelectedFields([]);
    setDateRange({ start: '', end: '' });
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedTemplateId(null);
    setTemplate(null);
    setIncludeAttachments(false);
    setIsExporting(false);
    setExportProgress(0);
    setExportResult(null);
    setError(null);
  }, []);

  /**
   * Save current export settings as a template
   */
  const saveAsTemplate = useCallback(async (name: string, description?: string) => {
    try {
      // In a real app, this would call an API to save the template
      const templateData = {
        name,
        description: description || `Export template created on ${new Date().toLocaleDateString()}`,
        format: selectedFormat,
        includedFields: selectedFields,
        filters: {
          dateRange,
          categories: selectedCategories,
          tags: selectedTags
        },
        options: {
          includeAttachments
        }
      };
      
      console.log('Saving template:', templateData);
      
      // Simulate successful save
      return { success: true, templateId: `template-${Date.now()}` };
    } catch (err) {
      setError(`Failed to save template: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Template save error:', err);
      return { success: false };
    }
  }, [selectedFormat, selectedFields, dateRange, selectedCategories, selectedTags, includeAttachments]);

  return {
    // State
    stage,
    selectedFormat,
    selectedFields,
    dateRange,
    selectedCategories,
    selectedTags,
    selectedTemplateId,
    template,
    includeAttachments,
    isExporting,
    exportProgress,
    exportResult,
    error,
    
    // Actions
    applyTemplate,
    updateFormat,
    updateSelectedFields,
    updateDateRange,
    updateSelectedCategories,
    updateSelectedTags,
    toggleIncludeAttachments,
    startExport,
    resetExport,
    saveAsTemplate,
    setStage
  };
};

export default useExport;