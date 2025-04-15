// frontend/src/features/tools/exports_imports/api/backupApi.ts
import { API_URL, handleApiError } from '../../shared/api';
import { BackupType, BackupRecord, ScheduleSettings } from '../types';

/**
 * Get all backups
 * @param options Query options
 * @returns A promise that resolves to an array of backup records
 */
export const getBackups = async (
  options: {
    page?: number;
    limit?: number;
    userId?: number;
  } = {}
): Promise<{ backups: BackupRecord[]; total: number }> => {
  try {
    const params = new URLSearchParams();
    
    if (options.page !== undefined) {
      params.append('page', options.page.toString());
    }
    
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString());
    }
    
    if (options.userId !== undefined) {
      params.append('userId', options.userId.toString());
    }
    
    const url = `${API_URL}/backups${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching backups:', error);
    throw error;
  }
};

/**
 * Get a backup by ID
 * @param backupId The backup ID
 * @returns A promise that resolves to the backup record
 */
export const getBackupById = async (backupId: string): Promise<BackupRecord> => {
  try {
    const response = await fetch(`${API_URL}/backups/${backupId}`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching backup ${backupId}:`, error);
    throw error;
  }
};

/**
 * Create a new backup
 * @param type Backup type
 * @param options Backup options
 * @returns A promise that resolves to the created backup
 */
export const createBackup = async (
  type: BackupType,
  options: {
    name?: string;
    components?: string[];
    userId?: number;
    description?: string;
  } = {}
): Promise<BackupRecord> => {
  try {
    const response = await fetch(`${API_URL}/backups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        ...options
      })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
};

/**
 * Delete a backup
 * @param backupId The backup ID
 * @returns A promise that resolves to a success indicator
 */
export const deleteBackup = async (backupId: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/backups/${backupId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting backup ${backupId}:`, error);
    throw error;
  }
};

/**
 * Restore from a backup
 * @param backupId The backup ID
 * @param options Restore options
 * @returns A promise that resolves to a success indicator
 */
export const restoreBackup = async (
  backupId: string,
  options: {
    overwriteExisting?: boolean;
    includeSettings?: boolean;
    includeFiles?: boolean;
  } = {}
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/backups/${backupId}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error restoring backup ${backupId}:`, error);
    throw error;
  }
};

/**
 * Download a backup
 * @param backupId The backup ID
 * @returns A promise that resolves to the download URL
 */
export const downloadBackup = async (backupId: string): Promise<{ downloadUrl: string; filename: string }> => {
  try {
    const response = await fetch(`${API_URL}/backups/${backupId}/download`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error downloading backup ${backupId}:`, error);
    throw error;
  }
};

/**
 * Upload a backup file
 * @param file The backup file
 * @returns A promise that resolves to the restored backup
 */
export const uploadBackup = async (file: File): Promise<BackupRecord> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/backups/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading backup:', error);
    throw error;
  }
};

/**
 * Get backup schedule settings
 * @returns A promise that resolves to the schedule settings
 */
export const getBackupSchedule = async (): Promise<ScheduleSettings> => {
  try {
    const response = await fetch(`${API_URL}/backups/schedule`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching backup schedule:', error);
    throw error;
  }
};

/**
 * Save backup schedule settings
 * @param settings The schedule settings
 * @returns A promise that resolves to a success indicator
 */
export const saveBackupSchedule = async (
  settings: ScheduleSettings
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/backups/schedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving backup schedule:', error);
    throw error;
  }
};

/**
 * Run backup verification
 * @param backupId The backup ID
 * @returns A promise that resolves to the verification result
 */
export const verifyBackup = async (
  backupId: string
): Promise<{ valid: boolean; details?: string }> => {
  try {
    const response = await fetch(`${API_URL}/backups/${backupId}/verify`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error verifying backup ${backupId}:`, error);
    throw error;
  }
};

/**
 * Configure cloud storage provider
 * @param provider The cloud provider
 * @param credentials Provider credentials
 * @returns A promise that resolves to a success indicator
 */
export const configureCloudProvider = async (
  provider: string,
  credentials: Record<string, string>
): Promise<{ success: boolean; connectionInfo?: any }> => {
  try {
    const response = await fetch(`${API_URL}/backups/cloud-storage/${provider}/configure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error configuring cloud provider ${provider}:`, error);
    throw error;
  }
};

/**
 * Check cloud storage provider status
 * @param provider The cloud provider
 * @returns A promise that resolves to a connection status
 */
export const checkCloudProviderStatus = async (
  provider: string
): Promise<{ connected: boolean; expiresAt?: string }> => {
  try {
    const response = await fetch(`${API_URL}/backups/cloud-storage/${provider}/status`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error checking cloud provider ${provider} status:`, error);
    throw error;
  }
};

/**
 * Get latest automatic backup status
 * @returns A promise that resolves to the latest backup status
 */
export const getLatestAutoBackupStatus = async (): Promise<{
  lastBackup?: string;
  status: string;
  nextScheduled?: string;
  message?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/backups/auto/status`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting auto backup status:', error);
    throw error;
  }
};

/**
 * Trigger a manual backup job
 * @param type Backup type
 * @param options Backup options
 * @returns A promise that resolves to the created backup job
 */
export const triggerManualBackupJob = async (
  type: BackupType,
  options: {
    name?: string;
    components?: string[];
    userId?: number;
    description?: string;
  } = {}
): Promise<{ jobId: string; status: string }> => {
  try {
    const response = await fetch(`${API_URL}/backups/job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        ...options
      })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error triggering manual backup job:', error);
    throw error;
  }
};

/**
 * Get backup job status
 * @param jobId The job ID
 * @returns A promise that resolves to the job status
 */
export const getBackupJobStatus = async (
  jobId: string
): Promise<{ jobId: string; status: string; progress: number; result?: any }> => {
  try {
    const response = await fetch(`${API_URL}/backups/job/${jobId}`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error getting backup job status for ${jobId}:`, error);
    throw error;
  }
};