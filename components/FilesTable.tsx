"use client";

import { useState } from "react";
import {
  File,
  Image,
  FileText,
  Music,
  Video,
  Archive,
  MoreVertical,
  Download,
  Trash2,
  Share,
  Edit,
  Eye,
  Star,
  StarOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  created_at: string;
  path: string;
  starred?: boolean;
}

interface FilesTableProps {
  files: FileItem[];
  loading: boolean;
  selectedFiles: string[];
  onFileSelect: (fileId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onDownload: (file: FileItem) => void;
  onDelete: (fileId: string) => void;
  onStar?: (fileId: string) => void;
  onShare?: (fileId: string) => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Video;
  if (mimeType.startsWith("audio/")) return Music;
  if (mimeType.includes("text") || mimeType.includes("document"))
    return FileText;
  if (mimeType.includes("zip") || mimeType.includes("archive")) return Archive;
  return File;
};

const getFileTypeColor = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "text-green-600";
  if (mimeType.startsWith("video/")) return "text-red-600";
  if (mimeType.startsWith("audio/")) return "text-purple-600";
  if (mimeType.includes("text") || mimeType.includes("document"))
    return "text-blue-600";
  if (mimeType.includes("pdf")) return "text-red-500";
  return "text-gray-600";
};

export default function FilesTable({
  files,
  loading,
  selectedFiles,
  onFileSelect,
  onSelectAll,
  onDownload,
  onDelete,
  onStar,
  onShare,
}: FilesTableProps) {
  const [sortBy, setSortBy] = useState<"name" | "size" | "created_at">(
    "created_at",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1;

    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name) * multiplier;
      case "size":
        return (a.size - b.size) * multiplier;
      case "created_at":
        return (
          (new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()) *
          multiplier
        );
      default:
        return 0;
    }
  });

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const allSelected = files.length > 0 && selectedFiles.length === files.length;
  const someSelected =
    selectedFiles.length > 0 && selectedFiles.length < files.length;

  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          <File className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          Loading files...
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-12 text-center">
          <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No files yet</h3>
          <p className="text-muted-foreground">
            Upload your first file to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 hidden md:table-header-group">
            <tr>
              <th className="w-12 p-3">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      const input = el.querySelector("input");
                      if (input) input.indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </th>
              <th className="text-left p-3 font-medium">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort("name")}
                >
                  Name
                  {sortBy === "name" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              </th>
              <th className="text-left p-3 font-medium">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort("created_at")}
                >
                  Modified
                  {sortBy === "created_at" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              </th>
              <th className="text-left p-3 font-medium">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => handleSort("size")}
                >
                  Size
                  {sortBy === "size" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              </th>
              <th className="w-12 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {sortedFiles.map((file) => {
              const FileIcon = getFileIcon(file.mime_type);
              const isSelected = selectedFiles.includes(file.id);

              return (
                <tr
                  key={file.id}
                  className={cn(
                    "border-t hover:bg-muted/30 transition-colors group",
                    isSelected && "bg-accent/50",
                  )}
                >
                  <td className="p-2 md:p-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onFileSelect(file.id)}
                    />
                  </td>
                  <td className="p-2 md:p-3">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <FileIcon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          getFileTypeColor(file.mime_type),
                        )}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className="font-medium truncate"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground md:hidden">
                          {formatDate(file.created_at)} ·{" "}
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      {file.starred && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground text-sm hidden md:table-cell">
                    {formatDate(file.created_at)}
                  </td>
                  <td className="p-3 text-muted-foreground text-sm hidden md:table-cell">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="p-2 md:p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 md:opacity-0 md:group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDownload(file)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        {onShare && (
                          <DropdownMenuItem onClick={() => onShare(file.id)}>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem disabled>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        {onStar && (
                          <DropdownMenuItem onClick={() => onStar(file.id)}>
                            {file.starred ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" />
                                Remove star
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Add star
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(file.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Move to trash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
