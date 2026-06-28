import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  return NextResponse.json({
    status: "success",
    urlConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}