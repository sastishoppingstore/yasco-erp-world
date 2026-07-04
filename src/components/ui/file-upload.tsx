import * as React from "react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Upload, File, FileImage, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface FileUploadProps {
  value?: string | string[];
  onChange: (files: string | string[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  preview?: boolean;
}

export function FileUpload({
  value,
  onChange,
  accept = "image/*,.pdf,.doc,.docx",
  multiple = false,
  maxSize = 5,
  maxFiles = 5,
  label,
  description,
  className,
  disabled = false,
  preview = true,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const files = Array.isArray(value) ? value : value ? [value] : [];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File ${file.name} is too large. Max size: ${maxSize}MB`);
      return false;
    }

    // Check file type
    if (accept !== "*") {
      const acceptedTypes = accept.split(",").map(t => t.trim());
      const fileExtension = `.${file.name.split(".").pop()}`;
      const fileType = file.type;
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith(".")) {
          return fileExtension.toLowerCase() === type.toLowerCase();
        }
        if (type.endsWith("/*")) {
          return fileType.startsWith(type.replace("/*", ""));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        toast.error(`File type not allowed: ${file.name}`);
        return false;
      }
    }

    return true;
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    // Check max files limit
    if (files.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);

    try {
      // Convert files to base64 (for demo - in production, upload to server/S3)
      const uploadedFiles = await Promise.all(
        validFiles.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // Update value
      if (multiple) {
        onChange([...files, ...uploadedFiles]);
      } else {
        onChange(uploadedFiles[0]);
      }

      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.target.files);
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    
    if (multiple) {
      const newFiles = files.filter((_, i) => i !== index);
      onChange(newFiles);
    } else {
      onChange("");
    }
    
    toast.success("File removed");
  };

  const openFileDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const getFileIcon = (file: string) => {
    if (file.startsWith("data:image")) return <FileImage className="h-5 w-5" />;
    if (file.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5" />;
  };

  const getFileName = (file: string, index: number) => {
    // Extract filename from base64 or return generic name
    return `File ${index + 1}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Max {maxSize}MB per file • {multiple ? `Up to ${maxFiles} files` : "Single file"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview/List of uploaded files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-3">
                {preview && file.startsWith("data:image") ? (
                  <img
                    src={file}
                    alt={`Upload ${index + 1}`}
                    className="h-16 w-16 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                    {getFileIcon(file)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getFileName(file, index)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(file.length / 1024)} KB
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  disabled={disabled}
                  className="h-8 w-8 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
