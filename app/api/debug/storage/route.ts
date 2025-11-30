// app/api/debug/storage/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get user info
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
          userError: userError?.message,
        },
        { status: 401 },
      );
    }

    // Test storage bucket access
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    // Test if we can list objects in the user-files bucket
    const { error: listError } = await supabase.storage
      .from("user-files")
      .list(user.id, {
        limit: 1,
      });

    // Test creating a simple text file to check upload permissions
    const testFileName = `${user.id}/test-${Date.now()}.txt`;
    const testContent = new Blob(["test content"], { type: "text/plain" });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-files")
      .upload(testFileName, testContent, {
        upsert: false,
      });

    // Clean up the test file
    if (uploadData) {
      await supabase.storage.from("user-files").remove([testFileName]);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      storage: {
        buckets: buckets?.length || 0,
        bucketError: bucketError?.message || null,
        userFolderAccess: !listError,
        listError: listError?.message || null,
        uploadTest: !uploadError,
        uploadError: uploadError?.message || null,
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? "✓ Set"
          : "✗ Missing",
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          ? "✓ Set"
          : "✗ Missing",
      },
    });
  } catch (err: unknown) {
    console.error("Debug storage error:", err);
    return NextResponse.json(
      {
        error: "Debug failed",
        message: err instanceof Error ? err.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? err instanceof Error
              ? err.stack
              : "Unknown error stack"
            : undefined,
      },
      { status: 500 },
    );
  }
}
