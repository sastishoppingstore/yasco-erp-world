import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/desktop/dexie-schema';
import { Camera, Loader2 } from 'lucide-react';

interface PhotoCaptureProps {
  reportId: string;
  onPhotoCaptured?: (photoId: string) => Promise<void> | void;
  maxSize?: number; // bytes
  quality?: number; // 0-1
}

/**
 * Photo Capture Component
 * 
 * Features:
 * - Camera stream capture
 * - Photo compression
 * - Location tagging (optional)
 * - Direct storage to Dexie
 * - Error handling
 */
export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  reportId,
  onPhotoCaptured,
  maxSize = 5242880, // 5MB default
  quality = 0.8,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Start camera stream
   */
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment', // Back camera
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access camera';
      setError(message);
      toast.error(message);
    }
  };

  /**
   * Stop camera stream
   */
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraOpen(false);
    }
  };

  /**
   * Capture photo from video stream
   */
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) throw new Error('Failed to get canvas context');

      // Set canvas dimensions to match video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0);

      // Convert to blob with compression
      await new Promise<void>((resolve, reject) => {
        canvasRef.current?.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            // Check size
            if (blob.size > maxSize) {
              reject(new Error(`Photo exceeds maximum size of ${maxSize / 1024 / 1024}MB`));
              return;
            }

            try {
              // Generate metadata
              const photoId = uuidv4();
              const now = new Date();
              const fileName = `photo_${now.getTime()}.jpg`;

              // Get location if available
              let latitude: number | undefined;
              let longitude: number | undefined;

              if (navigator.geolocation) {
                try {
                  const position = await new Promise<GeolocationCoordinates>(
                    (resolve, reject) =>
                      navigator.geolocation.getCurrentPosition(
                        (pos) => resolve(pos.coords),
                        reject
                      )
                  );
                  latitude = position.latitude;
                  longitude = position.longitude;
                } catch (locErr) {
                  console.warn('Location unavailable:', locErr);
                }
              }

              // Create file reader to get base64
              const reader = new FileReader();
              reader.onload = async () => {
                try {
                  const base64 = reader.result as string;

                  // Store in Dexie
                  await db.photos.add({
                    id: photoId,
                    reportId,
                    filePath: base64,
                    fileName,
                    mimeType: 'image/jpeg',
                    size: blob.size,
                    width: canvasRef.current?.width || 0,
                    height: canvasRef.current?.height || 0,
                    capturedAt: now,
                    latitude,
                    longitude,
                    category: 'progress',
                    uploadStatus: 'pending',
                  });

                  toast.success('Photo captured');
                  if (onPhotoCaptured) {
                    await onPhotoCaptured(photoId);
                  }

                  resolve();
                } catch (err) {
                  reject(err);
                }
              };
              reader.onerror = () => reject(new Error('Failed to read file'));
              reader.readAsDataURL(blob);
            } catch (err) {
              reject(err);
            }
          },
          'image/jpeg',
          quality
        );
      });

      stopCamera();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to capture photo';
      setError(message);
      toast.error(message);
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please select an image.');
      }

      if (file.size > maxSize) {
        throw new Error(`File exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
      }

      const photoId = uuidv4();
      const now = new Date();

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const img = new Image();

          img.onload = async () => {
            await db.photos.add({
              id: photoId,
              reportId,
              filePath: base64,
              fileName: file.name,
              mimeType: file.type,
              size: file.size,
              width: img.width,
              height: img.height,
              capturedAt: now,
              category: 'progress',
              uploadStatus: 'pending',
            });

            toast.success('Photo uploaded');
            if (onPhotoCaptured) {
              await onPhotoCaptured(photoId);
            }
            setIsCapturing(false);
          };

          img.onerror = () => {
            throw new Error('Failed to process image');
          };

          img.src = base64;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to process image';
          setError(message);
          toast.error(message);
          setIsCapturing(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        toast.error('Failed to read file');
        setIsCapturing(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload photo';
      setError(message);
      toast.error(message);
      setIsCapturing(false);
    }
  };

  if (isCameraOpen) {
    return (
      <div className="space-y-3">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-h-96"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="flex-1"
            size="sm"
          >
            {isCapturing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Capture
          </Button>
          <Button
            onClick={stopCamera}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={startCamera}
        variant="outline"
        size="sm"
        className="flex-1 gap-2"
      >
        <Camera className="w-4 h-4" />
        Take Photo
      </Button>
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        size="sm"
        className="flex-1"
      >
        Upload Photo
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default PhotoCapture;
