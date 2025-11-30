"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import FilesSidebar from "./FilesSidebar";
import FilesTable from "./FilesTable";
import UploadDialog from "./UploadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LayoutGrid, List, Filter, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileItem {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  created_at: string;
  path: string;
  starred?: boolean;
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/files");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        console.error("Failed to fetch files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    fetchFiles(); // Refresh the file list
    setUploadDialogOpen(false);
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId],
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedFiles(selected ? files.map((f) => f.id) : []);
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from("user-files")
        .download(file.path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to move this file to trash?")) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((file) => file.id !== fileId));
        setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
      } else {
        const errorText = await response.text();
        console.error("Delete failed:", errorText);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleStar = (fileId: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, starred: !file.starred } : file,
      ),
    );
  };

  const handleShare = (fileId: string) => {
    // TODO: Implement sharing functionality
    console.log("Share file:", fileId);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const bulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to move ${selectedFiles.length} files to trash?`,
      )
    )
      return;

    try {
      await Promise.all(
        selectedFiles.map((fileId) =>
          fetch(`/api/files/${fileId}`, { method: "DELETE" }),
        ),
      );

      setFiles((prev) =>
        prev.filter((file) => !selectedFiles.includes(file.id)),
      );
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error deleting files:", error);
    }
  };

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <FilesSidebar onUploadClick={() => setUploadDialogOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="border-b bg-background px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in files"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {selectedFiles.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedFiles.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkDelete}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "list" ? "grid" : "list")
                }
              >
                {viewMode === "list" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Sort by name</DropdownMenuItem>
                  <DropdownMenuItem>Sort by date</DropdownMenuItem>
                  <DropdownMenuItem>Sort by size</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem disabled>New folder</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* File Content */}
        <div className="flex-1 overflow-auto p-6">
          <FilesTable
            files={filteredFiles}
            loading={loading}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            onSelectAll={handleSelectAll}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onStar={handleStar}
            onShare={handleShare}
          />
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
