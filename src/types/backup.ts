export interface BackupJob {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  sourcePath: string;
  backupType: string;
}

export interface Backup {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  job: BackupJob;
}

export interface BackupsResponse {
  backups: Backup[];
}

export interface DownloadUrlResponse {
  downloadUrl: string;
}