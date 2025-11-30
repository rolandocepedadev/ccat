import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface AppUser {
  id: string;
  email?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    avatar_path?: string;
    avatar_url?: string;
  };
}

// Type guard to ensure we have the required properties
export function isValidUser(user: SupabaseUser | null): user is SupabaseUser {
  return user !== null && typeof user.id === "string";
}

// Helper to get display name from user
export function getUserDisplayName(user: AppUser): string {
  if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
    return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
  }
  if (user.user_metadata?.first_name) {
    return user.user_metadata.first_name;
  }
  if (user.email) {
    return user.email;
  }
  return "User";
}

// Helper to get user initials
export function getUserInitials(user: AppUser): string {
  if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
    return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase();
  }
  if (user.user_metadata?.first_name) {
    return user.user_metadata.first_name.slice(0, 2).toUpperCase();
  }
  if (user.email) {
    const words = user.email.split("@")[0].split(".");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return words[0].slice(0, 2).toUpperCase();
  }
  return "U";
}
