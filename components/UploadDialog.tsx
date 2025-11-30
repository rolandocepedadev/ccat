"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUpload {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface UploadDialogProps {
  onUploadComplete?: (
    files: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UploadDialog({
  onUploadComplete,
  trigger,
  open,
  onOpenChange,
}: UploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }

    if (!newOpen) {
      // Reset state when dialog closes
      setFiles([]);
      setIsDragOver(false);
    }
  };

  const currentOpen = open !== undefined ? open : isOpen;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const addFiles = (newFiles: File[]) => {
    const fileUploads: FileUpload[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...fileUploads]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (fileUpload: FileUpload) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileUpload.id ? { ...f, status: "uploading", progress: 0 } : f,
      ),
    );

    try {
      const formData = new FormData();
      formData.append("file", fileUpload.file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFiles((prev) =>
            prev.map((f) => (f.id === fileUpload.id ? { ...f, progress } : f)),
          );
        }
      });

      // Handle completion
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileUpload.id
                ? { ...f, status: "success", progress: 100 }
                : f,
            ),
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileUpload.id
                ? { ...f, status: "error", error: "Upload failed" }
                : f,
            ),
          );
        }
      };

      xhr.onerror = () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileUpload.id
              ? { ...f, status: "error", error: "Network error" }
              : f,
          ),
        );
      };

      xhr.open("POST", "/api/files");
      xhr.send(formData);
    } catch (error: unknown) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileUpload.id
            ? { ...f, status: "error", error: `Upload failed: ${error}` }
            : f,
        ),
      );
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");

    // Upload files sequentially to avoid overwhelming the server
    for (const file of pendingFiles) {
      await uploadFile(file);
    }

    // Check if all uploads completed successfully
    setTimeout(() => {
      const currentFiles = files.filter((f) => f.status === "success");
      if (currentFiles.length > 0 && onUploadComplete) {
        onUploadComplete(currentFiles);
      }
    }, 500);
  };

  const allCompleted =
    files.length > 0 &&
    files.every((f) => f.status === "success" || f.status === "error");
  const hasErrors = files.some((f) => f.status === "error");
  const canUpload = files.some((f) => f.status === "pending");

  return (
    <Dialog open={currentOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Upload any file type up to 50MB
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              Choose Files
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="flex-1 overflow-auto">
            <div className="space-y-2 max-h-60">
              {files.map((fileUpload) => (
                <div
                  key={fileUpload.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {fileUpload.file.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeFile(fileUpload.id)}
                        disabled={fileUpload.status === "uploading"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(fileUpload.file.size)}</span>
                      <div className="flex items-center gap-1">
                        {fileUpload.status === "pending" && (
                          <span>Ready to upload</span>
                        )}
                        {fileUpload.status === "uploading" && (
                          <>
                            <span>{fileUpload.progress}%</span>
                          </>
                        )}
                        {fileUpload.status === "success" && (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Uploaded</span>
                          </>
                        )}
                        {fileUpload.status === "error" && (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            <span className="text-red-600">
                              {fileUpload.error}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {fileUpload.status === "uploading" && (
                      <Progress
                        value={fileUpload.progress}
                        className="mt-2 h-1"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {files.length > 0 && (
              <>
                {files.length} file{files.length !== 1 ? "s" : ""} selected
                {hasErrors && (
                  <span className="text-red-600 ml-2">
                    • Some uploads failed
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {allCompleted ? "Done" : "Cancel"}
            </Button>

            {canUpload && (
              <Button onClick={uploadAll}>
                Upload {files.filter((f) => f.status === "pending").length}{" "}
                Files
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
