// frontend/src/features/tools/exports_imports/components/TemplateSelector.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button } from '../../../../shared';
import { FileFormat } from '../types';

// Template types
export type TemplateType = 'import' | 'export';

// Template interface
export interface Template {
  id: string;
  name: string;
  description: string;
  format: FileFormat;
  lastUsed?: string;
  updated?: string;
  isDefault?: boolean;
}

interface TemplateSelectorProps {
  /**
   * The type of templates to display
   */
  templateType: TemplateType;
  
  /**
   * Optional selected template ID
   */
  selectedTemplateId?: string;
  
  /**
   * Callback when a template is selected
   */
  onSelectTemplate: (templateId: string) => void;
  
  /**
   * Callback when the create new template button is clicked
   */
  onCreateTemplate?: () => void;
  
  /**
   * Optional additional CSS class
   */
  className?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templateType,
  selectedTemplateId,
  onSelectTemplate,
  onCreateTemplate,
  className = '',
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would fetch from an API
        // Here we'll use mock data for demonstration
        const mockTemplates = getMockTemplates(templateType);
        
        setTemplates(mockTemplates);
        setError(null);
      } catch (err) {
        setError('Failed to load templates');
        console.error('Template loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplates();
  }, [templateType]);
  
  // Get appropriate icon for format
  const getFormatIcon = (format: FileFormat) => {
    switch (format) {
      case 'csv':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'excel':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'json':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };
  
  // Format relative time string
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  
  return (
    <div className={`template-selector ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">
          {templateType === 'import' ? 'Import Templates' : 'Export Templates'}
        </h3>
        
        {onCreateTemplate && (
          <Button
            size="sm"
            onClick={onCreateTemplate}
          >
            Create Template
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-6">
          <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                <p>Failed to load templates. Please try again later.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${
                selectedTemplateId === template.id ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardBody className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {getFormatIcon(template.format)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.isDefault && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span className="capitalize mr-2">{template.format}</span>
                      <span className="mx-2">•</span>
                      <span>Last used: {formatRelativeTime(template.lastUsed)}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
          
          {templates.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-2 text-gray-500 dark:text-gray-400">No templates found</p>
              <button
                className="mt-4 text-primary-600 dark:text-primary-400 text-sm font-medium"
                onClick={onCreateTemplate}
              >
                Create a new template
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mock data for demonstration
const getMockTemplates = (type: TemplateType): Template[] => {
  if (type === 'import') {
    return [
      {
        id: 'amazon-template',
        name: 'Amazon Orders',
        description: 'Template for Amazon order history',
        format: 'csv',
        lastUsed: '2025-04-10T12:00:00Z',
        updated: '2025-03-15T08:30:00Z',
        isDefault: true
      },
      {
        id: 'bank-template',
        name: 'Bank Statement',
        description: 'Template for bank transactions',
        format: 'excel',
        lastUsed: '2025-04-01T16:20:00Z',
        updated: '2025-02-20T11:45:00Z'
      },
      {
        id: 'credit-card-template',
        name: 'Credit Card Statement',
        description: 'Template for credit card transactions',
        format: 'pdf',
        lastUsed: '2025-03-05T09:15:00Z',
        updated: '2025-01-10T14:30:00Z'
      }
    ];
  } else {
    return [
      {
        id: 'monthly-report',
        name: 'Monthly Expense Report',
        description: 'Template for monthly expense reports',
        format: 'excel',
        lastUsed: '2025-04-05T10:30:00Z',
        updated: '2025-03-01T16:45:00Z',
        isDefault: true
      },
      {
        id: 'tax-report',
        name: 'Tax Preparation Report',
        description: 'Template for tax preparation',
        format: 'pdf',
        lastUsed: '2025-03-15T14:20:00Z',
        updated: '2025-01-15T09:10:00Z'
      },
      {
        id: 'category-summary',
        name: 'Category Summary',
        description: 'Template for expense category summary',
        format: 'csv',
        lastUsed: '2025-04-12T11:45:00Z',
        updated: '2025-02-28T13:20:00Z'
      }
    ];
  }
};

export default TemplateSelector;