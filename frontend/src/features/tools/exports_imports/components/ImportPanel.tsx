// frontend/src/features/tools/exports_imports/components/ImportPanel.tsx
import React, { useState, useEffect } from 'react';
import { useImport } from '../hooks';
import { FileFormat } from '../types';
import { Button, Card, CardBody, CardHeader, Input, Select } from '../../../../shared';
import FormatSelector from './FormatSelector';
import MappingEditor from './MappingEditor';
import TemplateSelector from './TemplateSelector';
import ProgressIndicator from './ProgressIndicator';

const ImportPanel: React.FC = () => {
  const {
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
    handleFileSelect,
    applyTemplate,
    updateFieldMapping,
    validateImport,
    startImport,
    resetImport,
    cancelImport,
    setStage
  } = useImport();

  // File drop handling
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FileFormat | null>(null);

  // Define target fields based on the system
  const targetFields = [
    'merchant_name',
    'order_number',
    'purchase_date',
    'payment_method',
    'grand_total',
    'total_before_tax',
    'estimated_tax',
    'shipping_handling',
    'product_name',
    'quantity',
    'unit_price',
    'status',
    'notes',
    'categories',
    'tags',
    'billing_address'
  ];

  // Handle file drop event
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(Array.from(e.target.files));
    }
  };

  // Update file format
  useEffect(() => {
    if (fileFormat) {
      setSelectedFormat(fileFormat);
    }
  }, [fileFormat]);

  // Handle manual format selection
  const handleFormatSelection = (format: FileFormat) => {
    setSelectedFormat(format);
  };

  // Apply a template to the current data
  const handleTemplateSelect = (templateId: string) => {
    applyTemplate(templateId);
  };

  // Get source fields from preview data
  const getSourceFields = (): string[] => {
    if (!previewData || previewData.length === 0) return [];
    return Object.keys(previewData[0]);
  };

  // Render the current stage
  const renderStage = () => {
    switch (stage) {
      case 'upload':
        return (
          <div className="import-upload-stage">
            <div 
              className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
            >
              <div className="file-drop-content">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Drop your file here, or <span className="text-primary-600 dark:text-primary-400">browse</span>
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Supported formats: CSV, Excel, JSON, XML, QIF, OFX
                </p>
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.json,.xml,.qif,.ofx"
                  onChange={handleFileInputChange}
                />
                <Button
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  Select File
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Use a Template</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Applying a template will automatically map fields based on previous imports.
              </p>
              <TemplateSelector 
                templateType="import"
                selectedTemplateId={selectedTemplateId || undefined}
                onSelectTemplate={handleTemplateSelect}
                onCreateTemplate={() => {}}
              />
            </div>
          </div>
        );

      case 'mapping':
        return (
          <div className="import-mapping-stage">
            <Card className="mb-6">
              <CardHeader
                headerTitle="Selected File"
                subtitle={files.length > 0 ? `${files[0].name} (${(files[0].size / 1024).toFixed(2)} KB)` : ''}
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetImport}
                  >
                    Change File
                  </Button>
                }
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">File Format</h4>
                    <div className="flex items-center">
                      <FormatSelector
                        selectedFormat={selectedFormat}
                        onSelectFormat={handleFormatSelection}
                        operation="import"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Apply Template</h4>
                    <Select
                      className="w-full"
                      value={selectedTemplateId || ''}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                    >
                      <option value="">-- Select a Template --</option>
                      <option value="amazon-template">Amazon Orders</option>
                      <option value="bank-template">Bank Statement</option>
                      <option value="credit-card-template">Credit Card Statement</option>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium mb-4">Map Fields</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Match the fields from your file to the corresponding fields in the system.
                  </p>
                  
                  {previewData && previewData.length > 0 && (
                    <MappingEditor
                      sourceFields={getSourceFields()}
                      targetFields={targetFields}
                      mapping={fieldMapping}
                      onChange={updateFieldMapping}
                    />
                  )}
                </div>
              </CardBody>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={resetImport}
              >
                Back
              </Button>
              <Button
                onClick={validateImport}
                disabled={Object.keys(fieldMapping).length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'validation':
        return (
          <div className="import-validation-stage">
            <Card className="mb-6">
              <CardHeader
                headerTitle="Validation Results"
              />
              <CardBody>
                {validationErrors.length > 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          {validationErrors.length} validation issues found
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                          <ul className="list-disc list-inside space-y-1">
                            {validationErrors.slice(0, 5).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {validationErrors.length > 5 && (
                              <li>...and {validationErrors.length - 5} more issues</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                          Validation successful
                        </h3>
                        <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                          <p>Data is valid and ready to import.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="text-md font-medium mb-4">Import Preview</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Here's a preview of how your data will be imported. You can go back to correct any issues.
                  </p>
                  
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {Object.keys(fieldMapping)
                            .filter(key => fieldMapping[key])
                            .map(key => (
                              <th 
                                key={key}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                {fieldMapping[key]}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {previewData && previewData.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.keys(fieldMapping)
                              .filter(key => fieldMapping[key])
                              .map(key => (
                                <td 
                                  key={`${rowIndex}-${key}`}
                                  className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                                >
                                  {row[key] !== undefined ? String(row[key]) : ''}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStage('mapping')}
              >
                Back to Mapping
              </Button>
              <Button
                onClick={startImport}
                disabled={validationErrors.length > 0}
              >
                Start Import
              </Button>
            </div>
          </div>
        );

      case 'importing':
        return (
          <div className="import-progress-stage">
            <Card className="mb-6">
              <CardHeader
                headerTitle="Importing Data"
              />
              <CardBody>
                <div className="text-center mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">Importing your data</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Please wait while we process your file. This may take a few minutes depending on the file size.
                  </p>
                </div>

                <div className="max-w-md mx-auto mb-8">
                  <ProgressIndicator 
                    progress={importProgress} 
                    variant="primary" 
                    size="lg"
                    animated={true}
                    striped={true}
                  />
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Processing {Math.round(importProgress)}%
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                          Import Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={cancelImport}
              >
                Cancel Import
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="import-complete-stage">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-md text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-medium text-green-800 dark:text-green-300 mb-2">
                Import Complete!
              </h2>
              <p className="text-green-700 dark:text-green-400 mb-4">
                Your data has been successfully imported.
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader
                headerTitle="Import Summary"
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Total Records
                    </h4>
                    <p className="text-2xl font-medium">
                      {importResult?.totalRecords || 0}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Successfully Imported
                    </h4>
                    <p className="text-2xl font-medium text-green-600 dark:text-green-400">
                      {importResult?.importedRecords || 0}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Failed Records
                    </h4>
                    <p className="text-2xl font-medium text-red-600 dark:text-red-400">
                      {importResult?.failedRecords || 0}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Warnings
                    </h4>
                    <p className="text-2xl font-medium text-yellow-600 dark:text-yellow-400">
                      {importResult?.warnings || 0}
                    </p>
                  </div>
                </div>

                {importResult?.errors && importResult.errors.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-2">Errors</h4>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                      <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={resetImport}
              >
                Import Another File
              </Button>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        );
      
      default:
        return <div>Unknown stage</div>;
    }
  };

  return (
    <div className="import-panel">
      {renderStage()}
    </div>
  );
};

export default ImportPanel;