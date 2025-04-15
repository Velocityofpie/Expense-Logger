// frontend/src/features/tools/exports_imports/components/BackupPanel.tsx
import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Input, Select, Checkbox } from '../../../../shared';

// Backup types
type BackupType = 'full' | 'data' | 'settings' | 'custom';

// Mock backup data
interface BackupRecord {
  id: string;
  name: string;
  type: BackupType;
  date: string;
  size: string;
  status: 'completed' | 'failed' | 'in_progress';
}

const mockBackups: BackupRecord[] = [
  {
    id: 'backup-001',
    name: 'Weekly Backup',
    type: 'full',
    date: '2025-04-10 08:00:00',
    size: '32.5 MB',
    status: 'completed'
  },
  {
    id: 'backup-002',
    name: 'Monthly Backup',
    type: 'full',
    date: '2025-04-01 00:00:00',
    size: '35.1 MB',
    status: 'completed'
  },
  {
    id: 'backup-003',
    name: 'Pre-update Backup',
    type: 'full',
    date: '2025-03-15 12:30:00',
    size: '29.8 MB',
    status: 'completed'
  },
  {
    id: 'backup-004',
    name: 'Settings Only',
    type: 'settings',
    date: '2025-03-01 15:45:00',
    size: '0.5 MB',
    status: 'completed'
  }
];

const BackupPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'restore' | 'schedule'>('list');
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupList, setBackupList] = useState<BackupRecord[]>(mockBackups);
  
  // Create backup form state
  const [backupName, setBackupName] = useState('');
  const [backupType, setBackupType] = useState<BackupType>('full');
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  
  // Restore form state
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [restoreOptions, setRestoreOptions] = useState({
    overwriteExisting: true,
    includeSettings: true,
    includeFiles: true
  });
  
  // Schedule form state
  const [schedule, setSchedule] = useState({
    enabled: false,
    frequency: 'weekly',
    day: 'sunday',
    time: '00:00',
    retention: '30',
    cloudBackup: false,
    cloudProvider: 'none'
  });

  // Create a new backup
  const handleCreateBackup = () => {
    setBackupInProgress(true);
    
    // Simulate backup process
    setTimeout(() => {
      const newBackup: BackupRecord = {
        id: `backup-${Date.now().toString().substring(9)}`,
        name: backupName || `Backup ${new Date().toLocaleString()}`,
        type: backupType,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        size: `${(Math.random() * 10 + 25).toFixed(1)} MB`,
        status: 'completed'
      };
      
      setBackupList([newBackup, ...backupList]);
      setBackupInProgress(false);
      setBackupSuccess(true);
      
      // Reset success message after a few seconds
      setTimeout(() => {
        setBackupSuccess(false);
      }, 3000);
    }, 2000);
  };

  // Start restore process
  const handleRestore = () => {
    if (!selectedBackup) return;
    
    setRestoreInProgress(true);
    
    // Simulate restore process
    setTimeout(() => {
      setRestoreInProgress(false);
      setActiveTab('list');
      
      // Show success alert or notification here
    }, 3000);
  };

  // Save schedule settings
  const handleSaveSchedule = () => {
    // In a real app, this would save to the backend
    alert('Backup schedule saved!');
  };

  // Delete a backup
  const handleDeleteBackup = (backupId: string) => {
    // Confirmation would be better in a real app
    setBackupList(backupList.filter(backup => backup.id !== backupId));
  };

  // Format the date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="backup-panel">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'list'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('list')}
        >
          Backup History
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'create'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Create Backup
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'restore'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('restore')}
        >
          Restore
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'schedule'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
      </div>
      
      {/* Backup List */}
      {activeTab === 'list' && (
        <div className="backup-list">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Backup History</h2>
            <Button 
              onClick={() => setActiveTab('create')}
              size="sm"
            >
              New Backup
            </Button>
          </div>
          
          {backupList.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <p className="mt-2 text-gray-500 dark:text-gray-400">No backups found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Backup Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {backupList.map(backup => (
                    <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                        {backup.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {backup.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(backup.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {backup.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          backup.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : backup.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {backup.status === 'completed' ? 'Completed' : backup.status === 'in_progress' ? 'In Progress' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedBackup(backup.id);
                            setActiveTab('restore');
                          }}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                        >
                          Restore
                        </button>
                        <button 
                          onClick={() => {
                            // Add download logic here
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                        >
                          Download
                        </button>
                        <button 
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Create Backup */}
      {activeTab === 'create' && (
        <div className="create-backup">
          <h2 className="text-lg font-medium mb-4">Create New Backup</h2>
          
          <Card className="mb-6">
            <CardBody>
              <div className="mb-4">
                <label htmlFor="backupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Backup Name
                </label>
                <Input
                  id="backupName"
                  type="text"
                  placeholder="Weekly Backup"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="backupType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Backup Type
                </label>
                <Select
                  id="backupType"
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value as BackupType)}
                  className="w-full"
                >
                  <option value="full">Full Backup (All Data & Settings)</option>
                  <option value="data">Data Only (No Settings)</option>
                  <option value="settings">Settings Only (No Data)</option>
                  <option value="custom">Custom Backup</option>
                </Select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {backupType === 'full' && 'Complete backup of all data, settings, and files'}
                  {backupType === 'data' && 'Backup of all invoices, expenses, and files only'}
                  {backupType === 'settings' && 'Backup of user preferences, templates, and categories'}
                  {backupType === 'custom' && 'Select specific components to backup'}
                </p>
              </div>
              
              {backupType === 'custom' && (
                <div className="mb-4 ml-6 space-y-2">
                  <Checkbox label="Invoice Data" checked={true} />
                  <Checkbox label="Expense Data" checked={true} />
                  <Checkbox label="Categories & Tags" checked={true} />
                  <Checkbox label="Templates" checked={true} />
                  <Checkbox label="User Settings" checked={false} />
                  <Checkbox label="Uploaded Files & Attachments" checked={false} />
                </div>
              )}
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('list')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBackup}
                  disabled={backupInProgress}
                  isLoading={backupInProgress}
                  loadingText="Creating Backup..."
                >
                  Create Backup
                </Button>
              </div>
              
              {backupSuccess && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Backup Created Successfully</h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                        <p>Your backup has been created and added to the backup list.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
      
      {/* Restore Backup */}
      {activeTab === 'restore' && (
        <div className="restore-backup">
          <h2 className="text-lg font-medium mb-4">Restore from Backup</h2>
          
          <Card className="mb-6">
            <CardBody>
              <div className="mb-4">
                <label htmlFor="backupSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Backup to Restore
                </label>
                <Select
                  id="backupSelect"
                  value={selectedBackup || ''}
                  onChange={(e) => setSelectedBackup(e.target.value)}
                  className="w-full"
                >
                  <option value="" disabled>-- Select a Backup --</option>
                  {backupList.map(backup => (
                    <option key={backup.id} value={backup.id}>
                      {backup.name} ({formatDate(backup.date)}) - {backup.size}
                    </option>
                  ))}
                </Select>
              </div>
              
              {selectedBackup && (
                <>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Restore Options</h3>
                    <div className="space-y-2 ml-2">
                      <Checkbox 
                        label="Overwrite existing data" 
                        checked={restoreOptions.overwriteExisting}
                        onChange={() => setRestoreOptions(prev => ({
                          ...prev,
                          overwriteExisting: !prev.overwriteExisting
                        }))}
                      />
                      <Checkbox 
                        label="Restore user settings" 
                        checked={restoreOptions.includeSettings}
                        onChange={() => setRestoreOptions(prev => ({
                          ...prev,
                          includeSettings: !prev.includeSettings
                        }))}
                      />
                      <Checkbox 
                        label="Restore uploaded files" 
                        checked={restoreOptions.includeFiles}
                        onChange={() => setRestoreOptions(prev => ({
                          ...prev,
                          includeFiles: !prev.includeFiles
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Warning</h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                          <p>Restoring from a backup will replace your current data. This action cannot be undone.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('list')}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleRestore}
                      disabled={restoreInProgress}
                      isLoading={restoreInProgress}
                      loadingText="Restoring..."
                    >
                      Restore Backup
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}
      
      {/* Schedule Backups */}
      {activeTab === 'schedule' && (
        <div className="schedule-backups">
          <h2 className="text-lg font-medium mb-4">Schedule Automatic Backups</h2>
          
          <Card className="mb-6">
            <CardBody>
              <div className="mb-4">
                <Checkbox 
                  label="Enable automatic backups" 
                  checked={schedule.enabled}
                  onChange={() => setSchedule(prev => ({
                    ...prev,
                    enabled: !prev.enabled
                  }))}
                />
              </div>
              
              {schedule.enabled && (
                <>
                  <div className="mb-4">
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Backup Frequency
                    </label>
                    <Select
                      id="frequency"
                      value={schedule.frequency}
                      onChange={(e) => setSchedule(prev => ({
                        ...prev,
                        frequency: e.target.value
                      }))}
                      className="w-full"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Select>
                  </div>
                  
                  {schedule.frequency === 'weekly' && (
                    <div className="mb-4">
                      <label htmlFor="day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Day of the Week
                      </label>
                      <Select
                        id="day"
                        value={schedule.day}
                        onChange={(e) => setSchedule(prev => ({
                          ...prev,
                          day: e.target.value
                        }))}
                        className="w-full"
                      >
                        <option value="sunday">Sunday</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                      </Select>
                    </div>
                  )}
                  
                  {schedule.frequency === 'monthly' && (
                    <div className="mb-4">
                      <label htmlFor="day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Day of the Month
                      </label>
                      <Select
                        id="day"
                        value={schedule.day}
                        onChange={(e) => setSchedule(prev => ({
                          ...prev,
                          day: e.target.value
                        }))}
                        className="w-full"
                      >
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i + 1} value={`${i + 1}`}>{i + 1}</option>
                        ))}
                        <option value="last">Last day of month</option>
                      </Select>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time
                    </label>
                    <Input
                      id="time"
                      type="time"
                      value={schedule.time}
                      onChange={(e) => setSchedule(prev => ({
                        ...prev,
                        time: e.target.value
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="retention" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Backup Retention (days)
                    </label>
                    <Input
                      id="retention"
                      type="number"
                      min="1"
                      max="365"
                      value={schedule.retention}
                      onChange={(e) => setSchedule(prev => ({
                        ...prev,
                        retention: e.target.value
                      }))}
                      className="w-full"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Older backups will be automatically deleted
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <Checkbox 
                      label="Enable cloud backup" 
                      checked={schedule.cloudBackup}
                      onChange={() => setSchedule(prev => ({
                        ...prev,
                        cloudBackup: !prev.cloudBackup
                      }))}
                    />
                    <p className="mt-1 ml-6 text-sm text-gray-500 dark:text-gray-400">
                      Store backups in a cloud storage provider
                    </p>
                  </div>
                  
                  {schedule.cloudBackup && (
                    <div className="mb-4 ml-6">
                      <label htmlFor="cloudProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cloud Storage Provider
                      </label>
                      <Select
                        id="cloudProvider"
                        value={schedule.cloudProvider}
                        onChange={(e) => setSchedule(prev => ({
                          ...prev,
                          cloudProvider: e.target.value
                        }))}
                        className="w-full"
                      >
                        <option value="none">-- Select Provider --</option>
                        <option value="google_drive">Google Drive</option>
                        <option value="dropbox">Dropbox</option>
                        <option value="onedrive">OneDrive</option>
                        <option value="aws_s3">Amazon S3</option>
                      </Select>
                      <button className="mt-2 text-primary-600 dark:text-primary-400 text-sm">
                        Configure Connection
                      </button>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSchedule}
                >
                  Save Schedule
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BackupPanel;