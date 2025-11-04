import { Backup, BackupsResponse, DownloadUrlResponse } from '../types/backup';

export class BackupService {
  private static BASE_URL = '/api/v1/backup';

  static async getOrganizationBackups(): Promise<Backup[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/organization`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }

      const data: BackupsResponse = await response.json();
      return data.backups;
    } catch (error) {
      console.error('Error fetching backups:', error);
      throw error;
    }
  }

  static async getDownloadUrl(backupId: string): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/${backupId}/download`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data: DownloadUrlResponse = await response.json();
      return data.downloadUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }

  static async deleteBackup(backupId: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete backup');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  }
}