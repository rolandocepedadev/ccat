"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { getUserInitials } from "@/types/user";

interface ProfileAvatarProps {
  src?: string | null;
  avatarPath?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  firstName?: string;
  lastName?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export default function ProfileAvatar({
  src,
  avatarPath,
  alt,
  size = "md",
  className,
  firstName,
  lastName,
}: ProfileAvatarProps) {
  const { avatarUrl, loading } = useAvatarUrl(avatarPath);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // If we have an avatarPath, we should wait for it to load
  const shouldWaitForAvatar = Boolean(avatarPath);

  const getInitials = () => {
    // Use the shared helper with user-like object
    return getUserInitials({
      id: "",
      email: alt,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });
  };

  // Preload image to prevent flash
  useEffect(() => {
    const imageUrl = src || avatarUrl;

    if (!imageUrl) {
      setImageLoaded(false);
      setImageSrc(null);
      return;
    }

    // If it's the same image, don't reload
    if (imageSrc === imageUrl && imageLoaded) {
      return;
    }

    setImageLoaded(false);

    const img = new window.Image();
    img.onload = () => {
      setImageSrc(imageUrl);
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageSrc(null);
      setImageLoaded(false);
    };
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, avatarUrl, imageSrc, imageLoaded]);

  // Show invisible placeholder while waiting for avatar to load
  if (shouldWaitForAvatar && (loading || !imageLoaded)) {
    return (
      <div
        className={cn(
          "rounded-full bg-transparent flex items-center justify-center",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  // Show loaded image
  if (imageSrc && imageLoaded) {
    return (
      <Image
        src={imageSrc}
        alt={alt || "Profile"}
        width={
          size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 64
        }
        height={
          size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 64
        }
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  // Only show initials as fallback if we're not expecting an avatar
  if (!shouldWaitForAvatar) {
    return (
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-medium",
          sizeClasses[size],
          className,
        )}
      >
        {getInitials()}
      </div>
    );
  }

  // If we're waiting for an avatar but it failed to load, show transparent
  return (
    <div
      className={cn(
        "rounded-full bg-transparent flex items-center justify-center",
        sizeClasses[size],
        className,
      )}
    />
  );
}
