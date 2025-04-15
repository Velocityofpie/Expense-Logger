// frontend/src/features/tools/exports_imports/hooks/useBackup.ts
import { useState, useCallback, useEffect } from 'react';
import { 
  createBackup, 
  getBackups, 
  getBackupById, 
  deleteBackup, 
  restoreFromBackup, 
  downloadBackup, 
  getBackupSchedule, 
  saveBackupSchedule, 
  verifyBackupIntegrity 
} from '../utils/backupUtils';
import { BackupType, BackupRecord, ScheduleSettings } from '../types';

/**
 * Custom hook for managing backups
 */
export const useBackup = () => {
  // Backup list state
  const [backupList, setBackupList] = useState<BackupRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  
  // Backup creation state
  const [backupName, setBackupName] = useState('');
  const [backupType, setBackupType] = useState<BackupType>('full');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  
  // Restore state
  const [restoreOptions, setRestoreOptions] = useState({
    overwriteExisting: true,
    includeSettings: true,
    includeFiles: true
  });
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleSettings>({
    enabled: false,
    frequency: 'weekly',
    day: 'sunday',
    time: '00:00',
    retention: '30',
    cloudBackup: false,
    cloudProvider: 'none',
    backupType: 'full'
  });
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Load backups on mount
  useEffect(() => {
    fetchBackups();
  }, []);
  
  // Load selected backup details
  useEffect(() => {
    if (selectedBackupId) {
      fetchBackupDetails(selectedBackupId);
    }
  }, [selectedBackupId]);
  
  /**
   * Fetch all backups
   */
  const fetchBackups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const backups = await getBackups();
      setBackupList(backups);
    } catch (err) {
      setError(`Failed to fetch backups: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Backup fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Fetch details for a specific backup
   */
  const fetchBackupDetails = useCallback(async (backupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const backup = await getBackupById(backupId);
      
      // Update the backup in the list
      setBackupList(prev => 
        prev.map(b => b.id === backupId ? backup : b)
      );
    } catch (err) {
      setError(`Failed to fetch backup details: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Backup details fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Create a new backup
   */
  const createNewBackup = useCallback(async () => {
    try {
      setIsCreatingBackup(true);
      setError(null);
      
      const backup = await createBackup(
        backupType,
        backupType === 'custom' ? selectedComponents : undefined
      );
      
      // Add the new backup to the list
      setBackupList(prev => [backup, ...prev]);
      
      // Reset creation state
      setBackupName('');
      
      return backup;
    } catch (err) {
      setError(`Failed to create backup: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Backup creation error:', err);
      return null;
    } finally {
      setIsCreatingBackup(false);
    }
  }, [backupName, backupType, selectedComponents]);
  
  /**
   * Delete a backup
   */
  const removeBackup = useCallback(async (backupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await deleteBackup(backupId);
      
      if (success) {
        // Remove the backup from the list
        setBackupList(prev => prev.filter(b => b.id !== backupId));
        
        // Clear selected backup if it was the deleted one
        if (selectedBackupId === backupId) {
          setSelectedBackupId(null);
        }
      }
      
      return success;
    } catch (err) {
      setError(`Failed to delete backup: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Backup deletion error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedBackupId]);
  
  /**
   * Restore from a backup
   */
  const restoreBackup = useCallback(async (backupId: string) => {
    if (!backupId) {
      setError('No backup selected for restore');
      return false;
    }
    
    try {
      setIsRestoring(true);
      setError(null);
      
      const result = await restoreFromBackup(backupId, restoreOptions);
      
      return result.success;
    } catch (err) {
      setError(`Failed to restore backup: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Backup restore error:', err);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [restoreOptions]);
  
  /**
   * Download a backup
   */
  const downloadBackupFile = useCallback(async (backupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = await downloadBackup(backupId);
      
      // Trigger download using the URL
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${backupId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      return true;
    } catch (err) {
      setError(`Failed to download backup: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Backup download error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Verify backup integrity
   */
  const verifyBackup = useCallback(async (backupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await verifyBackupIntegrity(backupId);
      
      return result;
    } catch (err) {
      setError(`Failed to verify backup: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Backup verification error:', err);
      return { valid: false, details: String(err) };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Fetch backup schedule
   */
  const fetchBackupSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const scheduleSettings = await getBackupSchedule();
      setSchedule(scheduleSettings);
    } catch (err) {
      setError(`Failed to fetch backup schedule: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Backup schedule fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Save backup schedule
   */
  const saveScheduleSettings = useCallback(async () => {
    try {
      setIsSavingSchedule(true);
      setError(null);
      
      const success = await saveBackupSchedule(schedule);
      
      return success;
    } catch (err) {
      setError(`Failed to save backup schedule: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Backup schedule save error:', err);
      return false;
    } finally {
      setIsSavingSchedule(false);
    }
  }, [schedule]);
  
  /**
   * Update schedule settings
   */
  const updateSchedule = useCallback((newSchedule: Partial<ScheduleSettings>) => {
    setSchedule(prev => ({
      ...prev,
      ...newSchedule
    }));
  }, []);
  
  /**
   * Update restore options
   */
  const updateRestoreOptions = useCallback((newOptions: Partial<typeof restoreOptions>) => {
    setRestoreOptions(prev => ({
      ...prev,
      ...newOptions
    }));
  }, []);
  
  return {
    // State
    backupList,
    isLoading,
    selectedBackupId,
    backupName,
    backupType,
    selectedComponents,
    isCreatingBackup,
    restoreOptions,
    isRestoring,
    schedule,
    isSavingSchedule,
    error,
    
    // Actions
    fetchBackups,
    fetchBackupDetails,
    createNewBackup,
    removeBackup,
    restoreBackup,
    downloadBackupFile,
    verifyBackup,
    fetchBackupSchedule,
    saveScheduleSettings,
    
    // State updates
    setSelectedBackupId,
    setBackupName,
    setBackupType,
    setSelectedComponents,
    updateRestoreOptions,
    updateSchedule
  };
};

export default useBackup;