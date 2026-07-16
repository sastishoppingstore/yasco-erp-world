import { createWriteStream, existsSync, mkdirSync } from "fs";
import { unlink, stat } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { z } from "zod";

/**
 * FILE UPLOAD SERVICE - Complete File Management
 * Supports images, documents, compression, and validation
 */

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

interface UploadOptions {
  category: "invoices" | "certificates" | "photos" | "documents" | "reports";
  tenantId: number;
  userId: number;
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

interface UploadResult {
  success: boolean;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  url: string;
}

/**
 * GENERATE UNIQUE FILENAME
 */
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
}

/**
 * VALIDATE FILE
 */
function validateFile(
  file: Express.Multer.File | { mimetype: string; size: number }
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * UPLOAD FILE
 */
export async function uploadFile(
  file: Express.Multer.File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create category directory
    const categoryDir = path.join(
      UPLOAD_DIR,
      options.category,
      options.tenantId.toString()
    );
    if (!existsSync(categoryDir)) {
      mkdirSync(categoryDir, { recursive: true });
    }

    const filename = generateFilename(file.originalname);
    const filePath = path.join(categoryDir, filename);

    // Handle image compression
    if (
      file.mimetype.startsWith("image/") &&
      options.compress &&
      file.mimetype !== "image/gif"
    ) {
      await sharp(file.buffer)
        .resize(options.maxWidth || 1920, options.maxHeight || 1080, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(filePath);
    } else {
      // Save file directly
      const writeStream = createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();
    }

    // Get file stats
    const fileStats = await stat(filePath);

    return {
      success: true,
      filename,
      originalName: file.originalname,
      path: filePath,
      size: fileStats.size,
      mimeType: file.mimetype,
      url: `/uploads/${options.category}/${options.tenantId}/${filename}`,
    };
  } catch (error: any) {
    throw new Error(`File upload failed: ${error.message}`);
  }
}

/**
 * UPLOAD MULTIPLE FILES
 */
export async function uploadMultipleFiles(
  files: Express.Multer.File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  const promises = files.map((file) => uploadFile(file, options));
  return await Promise.all(promises);
}

/**
 * DELETE FILE
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await unlink(filePath);
    return true;
  } catch (error) {
    console.error("File deletion failed:", error);
    return false;
  }
}

/**
 * UPLOAD INVOICE ATTACHMENT
 */
export async function uploadInvoiceAttachment(
  file: Express.Multer.File,
  tenantId: number,
  userId: number,
  invoiceId: number
): Promise<UploadResult> {
  const result = await uploadFile(file, {
    category: "invoices",
    tenantId,
    userId,
  });

  // TODO: Save to database
  // await db.insert(invoice_attachments).values({
  //   invoiceId,
  //   filename: result.filename,
  //   originalName: result.originalName,
  //   path: result.path,
  //   size: result.size,
  //   mimeType: result.mimeType,
  //   uploadedBy: userId,
  //   tenantId,
  // });

  return result;
}

/**
 * UPLOAD CERTIFICATE ATTACHMENT
 */
export async function uploadCertificateAttachment(
  file: Express.Multer.File,
  tenantId: number,
  userId: number,
  certificateId: number
): Promise<UploadResult> {
  const result = await uploadFile(file, {
    category: "certificates",
    tenantId,
    userId,
  });

  // TODO: Save to database
  return result;
}

/**
 * UPLOAD HSE PHOTO
 */
export async function uploadHsePhoto(
  file: Express.Multer.File,
  tenantId: number,
  userId: number,
  incidentId: string
): Promise<UploadResult> {
  const result = await uploadFile(file, {
    category: "photos",
    tenantId,
    userId,
    compress: true,
    maxWidth: 1920,
    maxHeight: 1080,
  });

  // TODO: Save to database with incident reference
  return result;
}

/**
 * UPLOAD QUALITY INSPECTION PHOTO
 */
export async function uploadQualityPhoto(
  file: Express.Multer.File,
  tenantId: number,
  userId: number,
  inspectionId: number
): Promise<UploadResult> {
  const result = await uploadFile(file, {
    category: "photos",
    tenantId,
    userId,
    compress: true,
    maxWidth: 1920,
    maxHeight: 1080,
  });

  // TODO: Save to database
  // await db.insert(quality_photos).values({
  //   inspectionId,
  //   filename: result.filename,
  //   path: result.path,
  //   uploadedBy: userId,
  //   tenantId,
  // });

  return result;
}

/**
 * UPLOAD PROJECT DOCUMENT
 */
export async function uploadProjectDocument(
  file: Express.Multer.File,
  tenantId: number,
  userId: number,
  projectId: number,
  documentType: string
): Promise<UploadResult> {
  const result = await uploadFile(file, {
    category: "documents",
    tenantId,
    userId,
  });

  // TODO: Save to database with project reference
  return result;
}

/**
 * UPLOAD REPORT
 */
export async function uploadReport(
  file: Express.Multer.File,
  tenantId: number,
  userId: number,
  reportType: string
): Promise<UploadResult> {
  const result = await uploadFile(file, {
    category: "reports",
    tenantId,
    userId,
  });

  // TODO: Save to database
  return result;
}

/**
 * GET FILE INFO
 */
export async function getFileInfo(filePath: string): Promise<{
  exists: boolean;
  size?: number;
  createdAt?: Date;
  modifiedAt?: Date;
}> {
  try {
    const stats = await stat(filePath);
    return {
      exists: true,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch (error) {
    return { exists: false };
  }
}

/**
 * COMPRESS IMAGE
 */
export async function compressImage(
  inputPath: string,
  outputPath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<void> {
  await sharp(inputPath)
    .resize(options.width || 1920, options.height || 1080, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: options.quality || 85 })
    .toFile(outputPath);
}

/**
 * GENERATE THUMBNAIL
 */
export async function generateThumbnail(
  imagePath: string,
  thumbnailPath: string,
  size: number = 200
): Promise<void> {
  await sharp(imagePath)
    .resize(size, size, {
      fit: "cover",
    })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
}

/**
 * VALIDATE IMAGE
 */
export async function validateImage(
  filePath: string
): Promise<{ valid: boolean; width?: number; height?: number; format?: string }> {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      valid: true,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * CLEAN UP OLD FILES
 */
export async function cleanupOldFiles(
  category: string,
  daysOld: number = 90
): Promise<number> {
  // TODO: Implement cleanup logic
  // 1. Query database for files older than daysOld
  // 2. Delete files from filesystem
  // 3. Delete database records
  // 4. Return count of deleted files
  return 0;
}

/**
 * GET STORAGE STATS
 */
export async function getStorageStats(tenantId: number): Promise<{
  totalFiles: number;
  totalSize: number;
  byCategory: Record<string, { count: number; size: number }>;
}> {
  // TODO: Implement storage stats
  // Query database and filesystem
  return {
    totalFiles: 0,
    totalSize: 0,
    byCategory: {},
  };
}
