"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAvatarUrl(avatarPath: string | null | undefined): {
  avatarUrl: string | null;
  loading: boolean;
} {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!avatarPath) {
      setAvatarUrl(null);
      setLoading(false);
      return;
    }

    const loadAvatarUrl = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from("user-files")
          .createSignedUrl(avatarPath, 60 * 60 * 24); // 24 hours

        if (error) {
          console.error("Error loading avatar:", error);
          setAvatarUrl(null);
        } else {
          setAvatarUrl(data.signedUrl);
        }
      } catch (error) {
        console.error("Error loading avatar:", error);
        setAvatarUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadAvatarUrl();
  }, [avatarPath, supabase.storage]);

  return { avatarUrl, loading };
}
