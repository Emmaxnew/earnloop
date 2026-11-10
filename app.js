const SUPABASE_URL = "https://dtuvrvlawbdzoxoydvbx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_DJ4zlMOBd95gxBP9vANk6A_6PZS98XX";

async function connectEarnLoop() {
  const { createClient } = await import(
    "https://esm.sh/@supabase/supabase-js@2"
  );

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  window.earnLoopSupabase = supabase;

  console.log("EarnLoop connected to Supabase!");
}

connectEarnLoop();
