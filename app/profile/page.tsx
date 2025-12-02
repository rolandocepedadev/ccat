import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import { Suspense } from "react";
import Link from "next/link";
import { AuthButtonClient } from "@/components/auth-button-client";

import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Note: Dynamic export removed due to Next.js 16 Turbopack compatibility

async function AuthenticatedContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/files" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Files
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and profile information
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-full flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>CCAT File Manager</Link>
          </div>
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButtonClient />}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-medium mb-2">Loading...</h2>
                <p className="text-muted-foreground">Setting up your profile</p>
              </div>
            </div>
          }
        >
          <AuthenticatedContent />
        </Suspense>
      </div>
    </div>
  );
}
