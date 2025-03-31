// src/features/tools/Tools.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "react-bootstrap";
import OcrExtractor from "./ocr/OcrExtractor";
import TemplateManager from "./templates/TemplateManager";
import "./shared/tools-styles.css";

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
    if (tabParam && (tabParam === 'ocr' || tabParam === 'templates')) {
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
      
      <Card className="shadow-sm mb-5">
        <Card.Body className="p-0">
          {/* Tabs Navigation */}
          <div className="border-bottom">
            <ul className="nav nav-tabs px-3 pt-2">
              <li className="nav-item">
                <button 
                  className={`nav-link d-flex align-items-center ${activeTab === 'ocr' ? 'active' : ''}`}
                  onClick={() => handleTabChange('ocr')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                  </svg>
                  PDF OCR Extraction
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link d-flex align-items-center ${activeTab === 'templates' ? 'active' : ''}`}
                  onClick={() => handleTabChange('templates')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5v2z"/>
                    <path d="M3 12h10v2H3v-2z"/>
                  </svg>
                  OCR Templates
                </button>
              </li>
            </ul>
          </div>
          
          {/* Tab Content */}
          <div className="tab-content">
            <div className={`tab-pane fade ${activeTab === 'ocr' ? 'show active' : ''}`}>
              {activeTab === 'ocr' && <OcrExtractor />}
            </div>
            <div className={`tab-pane fade ${activeTab === 'templates' ? 'show active' : ''}`}>
              {activeTab === 'templates' && <TemplateManager />}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Tools;