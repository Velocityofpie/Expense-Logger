// frontend/src/features/tools/exports_imports/components/MappingEditor.tsx
import React, { useState, useEffect } from 'react';
import { Select, Button } from '../../../../shared';

interface MappingEditorProps {
  sourceFields: string[];
  targetFields: string[];
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
}

const MappingEditor: React.FC<MappingEditorProps> = ({
  sourceFields,
  targetFields,
  mapping,
  onChange,
}) => {
  const [autoMapped, setAutoMapped] = useState(false);

  // Auto-map fields on component mount if no mapping exists
  useEffect(() => {
    if (Object.keys(mapping).length === 0 && !autoMapped) {
      autoMapFields();
      setAutoMapped(true);
    }
  }, [sourceFields, targetFields]);

  // Auto-map fields based on name similarity
  const autoMapFields = () => {
    const newMapping: Record<string, string> = {};
    
    // Try to find exact matches first
    sourceFields.forEach(sourceField => {
      const normalizedSourceField = normalizeFieldName(sourceField);
      
      // Look for exact matches
      const exactMatch = targetFields.find(targetField => 
        normalizeFieldName(targetField) === normalizedSourceField
      );
      
      if (exactMatch) {
        newMapping[sourceField] = exactMatch;
      }
    });
    
    // Then try to find partial matches for unmapped source fields
    sourceFields.forEach(sourceField => {
      if (!newMapping[sourceField]) {
        const normalizedSourceField = normalizeFieldName(sourceField);
        
        // Look for partial matches
        const partialMatch = targetFields.find(targetField => {
          const normalizedTargetField = normalizeFieldName(targetField);
          return (
            normalizedSourceField.includes(normalizedTargetField) ||
            normalizedTargetField.includes(normalizedSourceField)
          );
        });
        
        if (partialMatch) {
          newMapping[sourceField] = partialMatch;
        }
      }
    });
    
    onChange(newMapping);
  };

  // Normalize field names for comparison
  const normalizeFieldName = (field: string): string => {
    return field
      .toLowerCase()
      .replace(/[_\s-]/g, '') // Remove underscores, spaces, hyphens
      .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric characters
  };

  // Handle mapping changes for a source field
  const handleMappingChange = (sourceField: string, targetField: string) => {
    onChange({
      ...mapping,
      [sourceField]: targetField,
    });
  };

  // Calculate mapping statistics
  const getMappingStats = () => {
    const mappedFields = Object.keys(mapping).filter(key => mapping[key] !== '');
    return {
      mapped: mappedFields.length,
      total: sourceFields.length,
      percent: Math.round((mappedFields.length / sourceFields.length) * 100),
    };
  };

  const stats = getMappingStats();

  return (
    <div className="field-mapping-editor">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium">Map Fields</h3>
        <div className="flex items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mr-4">
            <span className="font-medium">{stats.mapped}</span> of {stats.total} fields mapped ({stats.percent}%)
          </div>
          <Button 
            size="sm"
            variant="outline"
            onClick={autoMapFields}
          >
            Auto-Map Fields
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Match the fields from your import file to the system fields. Required fields are marked with an asterisk (*).
        </p>
      </div>
      
      <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/2">
                Source Field
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/2">
                Target Field
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
            {sourceFields.map((sourceField, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-dark-card' : 'bg-gray-50 dark:bg-gray-800'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {sourceField}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Select
                    value={mapping[sourceField] || ''}
                    onChange={(e) => handleMappingChange(sourceField, e.target.value)}
                    className="w-full"
                  >
                    <option value="">-- Do Not Import --</option>
                    {targetFields.map((targetField, idx) => (
                      <option key={idx} value={targetField}>
                        {targetField}
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MappingEditor;