// app/api/files/route.ts
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

export async function GET() {
  try {
    const user = await getUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (
    err: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    console.error(err);
    return new NextResponse(err.message || "Error fetching files", {
      status: 401,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    const supabase = await createClient();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const path = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("user-files")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Insert metadata
    const { data, error: insertError } = await supabase
      .from("files")
      .insert({
        user_id: user.id,
        name: file.name,
        path,
        size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(data, { status: 201 });
  } catch (
    err: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    console.error(err);
    return new NextResponse(err.message || "Error uploading file", {
      status: 400,
    });
  }
}
