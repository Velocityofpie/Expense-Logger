// src/features/tools/Tools.tsx - Updated to include ImportExportPage tab
import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OcrExtractor from "./ocr/OcrExtractor";
import TemplateManager from "./templates/TemplateManager";
import "./shared/tools-styles.css";

// Lazy load the ImportExportPage component to improve initial load performance
const ImportExportPage = lazy(() => import('./exports_imports/ImportExportPage'));

interface ToolsProps {
  defaultTab?: string;
}

const Tools: React.FC<ToolsProps> = ({ defaultTab = "ocr" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Parse tab from URL on component mount or URL change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['ocr', 'templates', 'exports-imports'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/tools?tab=${tab}`, { replace: true });
  };

  return (
    <div className="tools-container">
      <h1 className="mb-4">Tools</h1>
      
      <div className="card shadow-sm mb-5">
        <div className="card-body p-0">
          {/* Horizontal Tabs Navigation */}
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'ocr' ? 'active' : ''}`}
                onClick={() => handleTabChange('ocr')}
                role="tab"
                aria-selected={activeTab === 'ocr'}
                type="button"
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                PDF OCR Extraction
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => handleTabChange('templates')}
                role="tab"
                aria-selected={activeTab === 'templates'}
                type="button"
              >
                <i className="bi bi-file-earmark-ruled me-2"></i>
                OCR Templates
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'exports-imports' ? 'active' : ''}`}
                onClick={() => handleTabChange('exports-imports')}
                role="tab"
                aria-selected={activeTab === 'exports-imports'}
                type="button"
              >
                <i className="bi bi-arrow-down-up me-2"></i>
                Import/Export
              </button>
            </li>
          </ul>
          
          {/* Tab Content */}
          <div className="tab-content">
            <div 
              className={`tab-pane fade ${activeTab === 'ocr' ? 'show active' : ''}`}
              role="tabpanel"
            >
              {activeTab === 'ocr' && <OcrExtractor />}
            </div>
            <div 
              className={`tab-pane fade ${activeTab === 'templates' ? 'show active' : ''}`}
              role="tabpanel"
            >
              {activeTab === 'templates' && <TemplateManager />}
            </div>
            <div 
              className={`tab-pane fade ${activeTab === 'exports-imports' ? 'show active' : ''}`}
              role="tabpanel"
            >
              {activeTab === 'exports-imports' && (
                <Suspense fallback={<div className="p-4">Loading Import/Export tools...</div>}>
                  <ImportExportPage />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;