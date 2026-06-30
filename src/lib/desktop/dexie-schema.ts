import Dexie, { Table } from 'dexie';
import { z } from 'zod';

/**
 * Validation schemas for offline data
 */
export const offlineDailyReportSchema = z.object({
  id: z.string().uuid(),
  siteId: z.string(),
  siteName: z.string(),
  reportDate: z.date(),
  reportedBy: z.string(),
  reporterEmail: z.string().email(),
  weather: z.enum(['sunny', 'cloudy', 'rainy', 'foggy', 'windy']),
  temperature: z.number().min(-50).max(60),
  humidity: z.number().min(0).max(100),
  
  // Work progress
  workProgress: z.string(),
  laborForceCount: z.number().int().min(0),
  equipmentUsed: z.array(z.string()),
  tasksCompleted: z.array(z.string()),
  tasksRemaining: z.array(z.string()),
  
  // Safety & compliance
  safetyIncidents: z.number().int().min(0),
  incidentDetails: z.string().optional(),
  nearMissEvents: z.number().int().min(0),
  safetyChecksPassed: z.number().int().min(0),
  safetyChecksFailed: z.number().int().min(0),
  ppeUsageCompliance: z.number().min(0).max(100), // percentage
  
  // Quality & measurements
  qualityIssues: z.array(z.string()),
  qualityScore: z.number().min(0).max(100),
  measurementsVerified: z.boolean(),
  
  // Photos & media
  photoIds: z.array(z.string()),
  videoIds: z.array(z.string()),
  voiceNoteIds: z.array(z.string()),
  
  // Status & metadata
  status: z.enum(['draft', 'submitted', 'synced', 'conflict']).default('draft'),
  createdAt: z.date(),
  updatedAt: z.date(),
  syncedAt: z.date().optional(),
  lastSyncError: z.string().optional(),
});

export const offlinePhotoSchema = z.object({
  id: z.string().uuid(),
  reportId: z.string(),
  filePath: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  capturedAt: z.date(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  category: z.enum(['progress', 'safety', 'quality', 'incident', 'other']),
  uploadedAt: z.date().optional(),
  uploadStatus: z.enum(['pending', 'uploading', 'uploaded', 'failed']).default('pending'),
});

export const offlineVideoSchema = z.object({
  id: z.string().uuid(),
  reportId: z.string(),
  filePath: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number().int(),
  duration: z.number(), // seconds
  recordedAt: z.date(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  category: z.enum(['progress', 'safety', 'quality', 'incident', 'other']),
  uploadedAt: z.date().optional(),
  uploadStatus: z.enum(['pending', 'uploading', 'uploaded', 'failed']).default('pending'),
});

export const offlineVoiceNoteSchema = z.object({
  id: z.string().uuid(),
  reportId: z.string(),
  filePath: z.string(),
  fileName: z.string(),
  duration: z.number(), // seconds
  recordedAt: z.date(),
  transcription: z.string().optional(),
  transcriptionLanguage: z.string().default('en'),
  transcriptionStatus: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  uploadedAt: z.date().optional(),
  uploadStatus: z.enum(['pending', 'uploading', 'uploaded', 'failed']).default('pending'),
});

export const syncQueueItemSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['dailyReport', 'photo', 'video', 'voiceNote']),
  entityId: z.string(),
  operation: z.enum(['create', 'update', 'delete']),
  payload: z.any(), // Serialized entity
  attemptCount: z.number().int().default(0),
  maxAttempts: z.number().int().default(3),
  lastAttemptAt: z.date().optional(),
  nextAttemptAt: z.date().optional(),
  status: z.enum(['pending', 'syncing', 'synced', 'failed', 'conflict']).default('pending'),
  errorMessage: z.string().optional(),
  conflictResolution: z.enum(['manual', 'serverWins', 'clientWins', 'merge']).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const syncConflictSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['dailyReport', 'photo', 'video', 'voiceNote']),
  entityId: z.string(),
  localVersion: z.any(),
  remoteVersion: z.any(),
  conflictType: z.enum(['updateUpdate', 'deleteUpdate', 'updateDelete']),
  detectedAt: z.date(),
  resolvedAt: z.date().optional(),
  resolution: z.enum(['manual', 'serverWins', 'clientWins', 'merge']).optional(),
  resolutionNotes: z.string().optional(),
});

export const offlineSettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  autoSyncEnabled: z.boolean().default(true),
  autoSyncInterval: z.number().int().default(300000), // milliseconds
  compressionEnabled: z.boolean().default(true),
  maxPhotosPerReport: z.number().int().default(10),
  maxVideoSize: z.number().int().default(104857600), // 100MB
  maxAudioDuration: z.number().int().default(600), // 10 minutes
  preferredPhotoQuality: z.enum(['low', 'medium', 'high']).default('high'),
  enableLocationTracking: z.boolean().default(true),
  enableOfflineMode: z.boolean().default(true),
  notificationsEnabled: z.boolean().default(true),
  lastSettingsSync: z.date().optional(),
});

export type OfflineDailyReport = z.infer<typeof offlineDailyReportSchema>;
export type OfflinePhoto = z.infer<typeof offlinePhotoSchema>;
export type OfflineVideo = z.infer<typeof offlineVideoSchema>;
export type OfflineVoiceNote = z.infer<typeof offlineVoiceNoteSchema>;
export type SyncQueueItem = z.infer<typeof syncQueueItemSchema>;
export type SyncConflict = z.infer<typeof syncConflictSchema>;
export type OfflineSettings = z.infer<typeof offlineSettingsSchema>;

/**
 * Dexie database for offline storage
 */
export class DesktopDatabase extends Dexie {
  dailyReports!: Table<OfflineDailyReport>;
  photos!: Table<OfflinePhoto>;
  videos!: Table<OfflineVideo>;
  voiceNotes!: Table<OfflineVoiceNote>;
  syncQueue!: Table<SyncQueueItem>;
  syncConflicts!: Table<SyncConflict>;
  settings!: Table<OfflineSettings>;

  constructor() {
    super('YascoERP');
    this.version(1).stores({
      dailyReports: '++id, siteId, reportDate, status',
      photos: '++id, reportId, uploadStatus',
      videos: '++id, reportId, uploadStatus',
      voiceNotes: '++id, reportId, uploadStatus',
      syncQueue: '++id, entityType, entityId, status, nextAttemptAt',
      syncConflicts: '++id, entityType, entityId, resolvedAt',
      settings: 'id, userId',
    });
  }

  /**
   * Initialize default settings
   */
  async initializeSettings(userId: string): Promise<void> {
    const existing = await this.settings.get(userId);
    if (!existing) {
      await this.settings.add({
        id: userId,
        userId,
        autoSyncEnabled: true,
        autoSyncInterval: 300000,
        compressionEnabled: true,
        maxPhotosPerReport: 10,
        maxVideoSize: 104857600,
        maxAudioDuration: 600,
        preferredPhotoQuality: 'high',
        enableLocationTracking: true,
        enableOfflineMode: true,
        notificationsEnabled: true,
      });
    }
  }

  /**
   * Clear all data for a user (used during logout)
   */
  async clearUserData(): Promise<void> {
    await this.dailyReports.clear();
    await this.photos.clear();
    await this.videos.clear();
    await this.voiceNotes.clear();
    await this.syncQueue.clear();
    await this.syncConflicts.clear();
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    pendingReports: number;
    failedReports: number;
    conflictReports: number;
    pendingMedia: number;
    totalQueueItems: number;
  }> {
    const [
      pendingReports,
      failedReports,
      conflictReports,
      pendingPhotos,
      pendingVideos,
      pendingVoices,
      totalQueueItems,
    ] = await Promise.all([
      this.dailyReports.where('status').equals('draft').count(),
      this.dailyReports.where('status').equals('conflict').count(),
      this.syncConflicts.count(),
      this.photos.where('uploadStatus').equals('pending').count(),
      this.videos.where('uploadStatus').equals('pending').count(),
      this.voiceNotes.where('uploadStatus').equals('pending').count(),
      this.syncQueue.where('status').notEqual('synced').count(),
    ]);

    return {
      pendingReports,
      failedReports,
      conflictReports,
      pendingMedia: pendingPhotos + pendingVideos + pendingVoices,
      totalQueueItems,
    };
  }
}

/**
 * Global database instance
 */
export const db = new DesktopDatabase();
