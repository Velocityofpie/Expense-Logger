// frontend/src/features/tools/exports_imports/components/ExportPanel.tsx
import React, { useState } from 'react';
import { Button, Card, CardBody, Select, Input, Checkbox } from '../../../../shared';

// Export format options
type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json' | 'zip';

// Export data types
type ExportDataType = 'invoices' | 'expenses' | 'categories' | 'summary' | 'full';

const ExportPanel: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
  const [selectedDataType, setSelectedDataType] = useState<ExportDataType>('invoices');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Mock categories and tags
  const availableCategories = [
    'Electronics', 'Home Office', 'Utilities', 'Subscriptions', 
    'Travel', 'Food', 'Entertainment', 'Medical', 'Home Improvement'
  ];
  
  const availableTags = [
    'Tax Deductible', 'Business', 'Personal', 'Reimbursable', 
    'Recurring', 'One-time', 'High Priority', 'Review Needed'
  ];

  // Handle format change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFormat(e.target.value as ExportFormat);
  };

  // Handle data type change
  const handleDataTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataType(e.target.value as ExportDataType);
  };

  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Handle tag selection
  const handleTagChange = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Start export process
  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setDownloadUrl('data:text/plain;charset=utf-8,exported_data.xlsx'); // Mock download URL
    }, 2000);
  };

  // Reset export form
  const resetExport = () => {
    setExportComplete(false);
    setDownloadUrl(null);
  };

  return (
    <div className="export-panel">
      {!exportComplete ? (
        <>
          <h2 className="text-lg font-medium mb-4">Export Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left column - Basic export options */}
            <div>
              <div className="mb-4">
                <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Export Format
                </label>
                <Select
                  id="exportFormat"
                  value={selectedFormat}
                  onChange={handleFormatChange}
                  className="w-full"
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="pdf">PDF Report (.pdf)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="zip">ZIP Archive (.zip)</option>
                </Select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {selectedFormat === 'excel' && 'Comprehensive spreadsheet with multiple tabs'}
                  {selectedFormat === 'csv' && 'Simple format compatible with most software'}
                  {selectedFormat === 'pdf' && 'Professional formatted report with charts'}
                  {selectedFormat === 'json' && 'Structured data format for developers'}
                  {selectedFormat === 'zip' && 'Compressed archive with all data and attachments'}
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data to Export
                </label>
                <Select
                  id="dataType"
                  value={selectedDataType}
                  onChange={handleDataTypeChange}
                  className="w-full"
                >
                  <option value="invoices">Invoices</option>
                  <option value="expenses">Expenses</option>
                  <option value="categories">Categories & Tags</option>
                  <option value="summary">Summary Reports</option>
                  <option value="full">Full Data Export</option>
                </Select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Start Date
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      name="start"
                      value={dateRange.start}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      name="end"
                      value={dateRange.end}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <Checkbox
                  label="Include File Attachments"
                  checked={includeAttachments}
                  onChange={() => setIncludeAttachments(!includeAttachments)}
                />
                <p className="mt-1 ml-6 text-sm text-gray-500 dark:text-gray-400">
                  Include all linked files and documents
                </p>
              </div>
            </div>
            
            {/* Right column - Categories and tags */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Categories
                </label>
                <div className="max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                  {availableCategories.map(category => (
                    <div key={category} className="mb-2">
                      <Checkbox
                        label={category}
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagChange(tag)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedTags.includes(tag)
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Export Info</h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      <p>Your export will include approximately 156 records based on your current filters.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
            >
              Save Export Settings
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              isLoading={isExporting}
              loadingText="Exporting..."
            >
              Export Data
            </Button>
          </div>
        </>
      ) : (
        <div className="export-complete">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-md text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Export Complete!</h2>
            <p className="text-green-700 dark:text-green-400 mb-4">Your data has been successfully exported.</p>
            
            <div className="flex justify-center">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={`expense_data_export_${new Date().toISOString().split('T')[0]}.${selectedFormat}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download File
                </a>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Export Summary</h3>
            <Card>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Format</p>
                    <p className="font-medium capitalize">{selectedFormat}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Data Type</p>
                    <p className="font-medium capitalize">{selectedDataType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Records Exported</p>
                    <p className="font-medium">156</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
                    <p className="font-medium">1.2 MB</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date Range</p>
                    <p className="font-medium">
                      {dateRange.start || 'All'} to {dateRange.end || 'All'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Filters Applied</p>
                    <p className="font-medium">
                      {selectedCategories.length || selectedTags.length
                        ? `${selectedCategories.length} categories, ${selectedTags.length} tags`
                        : 'None'}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetExport}
            >
              New Export
            </Button>
            <Button>
              View Export History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;