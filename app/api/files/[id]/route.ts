// app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    const supabase = await createClient();
    const resolvedParams = await params;
    const fileId = resolvedParams.id;

    // Get file metadata (to know storage path)
    const { data: file, error: selectError } = await supabase
      .from("files")
      .select("id, path, user_id")
      .eq("id", fileId)
      .single();

    if (selectError || !file) {
      return new NextResponse("File not found", { status: 404 });
    }

    if (file.user_id !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("user-files")
      .remove([file.path]);

    if (storageError) throw storageError;

    // Delete metadata row
    const { error: deleteError } = await supabase
      .from("files")
      .delete()
      .eq("id", fileId);

    if (deleteError) throw deleteError;

    return new NextResponse(null, { status: 204 });
  } catch (
    err: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    console.error(err);
    return new NextResponse(err.message || "Error deleting file", {
      status: 400,
    });
  }
}
