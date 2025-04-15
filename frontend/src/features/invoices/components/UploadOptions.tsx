// src/features/invoices/components/UploadOptions.tsx
import React from 'react';
import { Checkbox } from '../../../shared';

interface UploadOptionsProps {
  useOcrTemplates: boolean;
  setUseOcrTemplates: (value: boolean) => void;
  showDebugInfo: boolean;
  setShowDebugInfo: (value: boolean) => void;
}

const UploadOptions: React.FC<UploadOptionsProps> = ({
  useOcrTemplates,
  setUseOcrTemplates,
  showDebugInfo,
  setShowDebugInfo
}) => {
  // Handler for OCR template checkbox to ensure boolean is set correctly
  const handleOcrTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    console.log(`OCR Templates checkbox changed to: ${isChecked}`);
    setUseOcrTemplates(isChecked);
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
      <div className="flex items-center">
        <Checkbox
          id="use-ocr-templates"
          checked={useOcrTemplates}
          onChange={handleOcrTemplateChange}
        />
        <label htmlFor="use-ocr-templates" className="ml-2 block text-sm text-gray-900">
          Use OCR Templates for extraction {useOcrTemplates ? '(Enabled)' : '(Disabled)'}
        </label>
      </div>
      
      <div className="flex items-center">
        <Checkbox
          id="show-debug-info"
          checked={showDebugInfo}
          onChange={(e) => setShowDebugInfo(e.target.checked)}
        />
        <label htmlFor="show-debug-info" className="ml-2 block text-sm text-gray-900">
          Show Debug Information
        </label>
      </div>
    </div>
  );
};

export default UploadOptions;