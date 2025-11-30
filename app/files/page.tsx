import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import FileManager from "@/components/FileManager";

async function AuthenticatedContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <FileManager />;
}

export default function FilesPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-full flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>CCAT Drive</Link>
          </div>
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-medium mb-2">Loading...</h2>
                <p className="text-muted-foreground">Setting up your files</p>
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
