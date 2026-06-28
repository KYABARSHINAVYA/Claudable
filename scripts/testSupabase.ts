import { supabase } from "../lib/supabase/client";

async function test() {
  console.log("Supabase URL:");
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

  console.log("Supabase initialized successfully");
}

test();