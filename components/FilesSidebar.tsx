"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { File, Users, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface FilesSidebarProps {
  onUploadClick?: () => void;
}

export default function FilesSidebar({ onUploadClick }: FilesSidebarProps) {
  const pathname = usePathname();

  const sidebarItems: SidebarItem[] = [
    {
      name: "My Files",
      href: "/files",
      icon: File,
    },
    {
      name: "Shared with me",
      href: "/files/shared",
      icon: Users,
    },
    {
      name: "Trash",
      href: "/files/trash",
      icon: Trash2,
    },
  ];

  return (
    <div className="w-64 h-full bg-background border-r border-border p-4 flex flex-col">
      {/* New/Upload Button */}
      <div className="mb-6">
        <Button
          onClick={onUploadClick}
          className="w-full justify-center gap-3 h-12 rounded-full"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          New
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                  {item.count && (
                    <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Storage Info */}
      <div className="mt-auto pt-4 border-t">
        <div className="text-xs text-muted-foreground mb-2">Storage</div>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div className="bg-primary h-2 rounded-full w-1/3"></div>
        </div>
        <div className="text-xs text-muted-foreground">0.5 GB of 1 GB used</div>
      </div>
    </div>
  );
}
