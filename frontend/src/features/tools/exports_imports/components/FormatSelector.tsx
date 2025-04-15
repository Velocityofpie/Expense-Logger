// frontend/src/features/tools/exports_imports/components/FormatSelector.tsx
import React from 'react';
import { Card, CardBody } from '../../../../shared';

// Format types
export type FileFormat = 
  | 'csv' 
  | 'excel' 
  | 'pdf' 
  | 'json'
  | 'xml'
  | 'qif'
  | 'ofx'
  | 'zip';

// Format details
interface FormatDetails {
  name: string;
  description: string;
  icon: React.ReactNode;
  supportedOperations: ('import' | 'export')[];
}

interface FormatSelectorProps {
  selectedFormat: FileFormat | null;
  onSelectFormat: (format: FileFormat) => void;
  operation: 'import' | 'export';
}

const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onSelectFormat,
  operation
}) => {
  // Format definitions with details
  const formats: Record<FileFormat, FormatDetails> = {
    csv: {
      name: 'CSV',
      description: 'Simple, widely compatible spreadsheet format',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      supportedOperations: ['import', 'export']
    },
    excel: {
      name: 'Excel',
      description: 'Full-featured spreadsheet format (XLSX)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      supportedOperations: ['import', 'export']
    },
    pdf: {
      name: 'PDF',
      description: 'Portable Document Format',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      supportedOperations: ['import', 'export']
    },
    json: {
      name: 'JSON',
      description: 'JavaScript Object Notation for structured data',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      supportedOperations: ['import', 'export']
    },
    xml: {
      name: 'XML',
      description: 'Extensible Markup Language for structured data',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      supportedOperations: ['import', 'export']
    },
    qif: {
      name: 'QIF',
      description: 'Quicken Interchange Format for financial data',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      supportedOperations: ['import']
    },
    ofx: {
      name: 'OFX',
      description: 'Open Financial Exchange format for financial data',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      supportedOperations: ['import']
    },
    zip: {
      name: 'ZIP',
      description: 'Compressed archive for multiple files',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      supportedOperations: ['export']
    }
  };

  // Filter formats based on operation
  const availableFormats = Object.entries(formats)
    .filter(([_, details]) => details.supportedOperations.includes(operation))
    .map(([key, _]) => key as FileFormat);

  return (
    <div className="format-selector">
      <h3 className="text-md font-medium mb-2">
        Select {operation === 'import' ? 'Import' : 'Export'} Format
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableFormats.map((format) => (
          <Card 
            key={format}
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              selectedFormat === format ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
            }`}
            onClick={() => onSelectFormat(format)}
          >
            <CardBody className="p-4 text-center">
              <div className="flex justify-center mb-2">
                {formats[format].icon}
              </div>
              <h4 className="font-medium mb-1">{formats[format].name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formats[format].description}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
      
      {selectedFormat && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Format Details</h4>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                {formats[selectedFormat].icon}
              </div>
              <div>
                <h5 className="font-medium mb-1">{formats[selectedFormat].name} Format</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {formats[selectedFormat].description}
                </p>
                
                {selectedFormat === 'csv' && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-1">• Simple text format with comma-separated values</p>
                    <p className="mb-1">• Compatible with virtually all spreadsheet applications</p>
                    <p className="mb-1">• Best for simple data without formatting</p>
                    <p>• Good for direct import into other systems</p>
                  </div>
                )}
                
                {selectedFormat === 'excel' && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-1">• Rich format with multiple sheets and formatting</p>
                    <p className="mb-1">• Supports formulas, charts, and complex data structures</p>
                    <p className="mb-1">• Compatible with Microsoft Excel and similar applications</p>
                    <p>• Good for analysis and reporting</p>
                  </div>
                )}
                
                {selectedFormat === 'pdf' && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-1">• Fixed layout document format</p>
                    <p className="mb-1">• Preserves exact visual formatting</p>
                    <p className="mb-1">• Can be viewed on almost any device</p>
                    <p>• Good for archiving and sharing</p>
                  </div>
                )}
                
                {selectedFormat === 'json' && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-1">• Standard data interchange format</p>
                    <p className="mb-1">• Easy for machines to parse and generate</p>
                    <p className="mb-1">• Supports nested and complex data structures</p>
                    <p>• Ideal for developers and API integration</p>
                  </div>
                )}
                
                {selectedFormat === 'qif' || selectedFormat === 'ofx' && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-1">• Financial data interchange format</p>
                    <p className="mb-1">• Commonly used for bank statements and transactions</p>
                    <p className="mb-1">• Compatible with many financial applications</p>
                    <p>• Good for importing financial records</p>
                  </div>
                )}
                
                {selectedFormat === 'zip' && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-1">• Compressed archive format</p>
                    <p className="mb-1">• Contains multiple files in a single package</p>
                    <p className="mb-1">• Reduces file size for easier transfer</p>
                    <p>• Good for complete backups and large exports</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormatSelector;