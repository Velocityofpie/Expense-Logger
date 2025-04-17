// frontend/src/features/tools/exports_imports/ImportExportPage.tsx
import React, { useState } from 'react';
import { Tabs, Tab } from '../../../shared';
import ExportPanel from './components/ExportPanel';
import BackupPanel from './components/BackupPanel';
import { useNavigate, useLocation } from 'react-router-dom';

// Create a stub for ImportPanel since it was empty in the files
import './styles/import-export.css';

const ImportPanel = React.lazy(() => import('./components/ImportPanel'));

interface ImportExportPageProps {
  defaultTab?: string;
}

const ImportExportPage: React.FC<ImportExportPageProps> = ({ defaultTab = 'export' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Parse tab from URL if available
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['import', 'export', 'backup'].includes(tabParam)) {
      return tabParam;
    }
    return defaultTab;
  });

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/tools/exports-imports?tab=${tabId}`, { replace: true });
  };

  return (
    <div className="import-export-container">
      <h1 className="text-2xl font-semibold mb-6">Data Import & Export</h1>
      
      <div className="card shadow-sm mb-6">
        <div className="card-body p-0">
          <Tabs activeTab={activeTab} onChange={handleTabChange} className="border-b-0">
            <Tab 
              id="import" 
              label="Import Data" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
              }
            />
            <Tab 
              id="export" 
              label="Export Data" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            />
            <Tab 
              id="backup" 
              label="Backup & Restore" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </Tabs>
          
          <div className="p-6">
            {activeTab === 'import' && (
              <React.Suspense fallback={<div>Loading import panel...</div>}>
                <ImportPanel />
              </React.Suspense>
            )}
            {activeTab === 'export' && <ExportPanel />}
            {activeTab === 'backup' && <BackupPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExportPage;