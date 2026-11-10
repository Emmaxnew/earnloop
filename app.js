const SUPABASE_URL = "https://dtuvrvlawbdzoxoydvbx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_DJ4zlMOBd95gxBP9vANk6A_6PZS98XX";

async function startEarnLoop() {
    const { createClient } = await import(
        "https://esm.sh/@supabase/supabase-js@2"
    );

    const supabase = createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    window.earnLoopSupabase = supabase;

    const section = document.createElement("section");
    section.className = "section";
    section.id = "account";

    section.innerHTML = `
        <h2>EarnLoop Account</h2>
        <p class="subtitle">Your account and rewards overview.</p>

        <div style="max-width:520px;margin:auto;background:#101d2d;padding:25px;border-radius:14px;text-align:left">

            <div id="authForm">
                <h3>Welcome to EarnLoop!</h3>
                <p style="color:#aab7c7;margin:10px 0 20px">
                    Sign in or create your account.
                </p>

                <input id="email" type="email"
                    placeholder="Email address"
                    autocomplete="email"
                    style="width:100%;padding:14px;margin-bottom:12px">

                <input id="password" type="password"
                    placeholder="Password"
                    autocomplete="current-password"
                    style="width:100%;padding:14px;margin-bottom:12px">

                <button id="signup" class="button"
                    style="border:0;cursor:pointer">
                    Create account
                </button>

                <button id="login" class="button"
                    style="background:#263c50;color:white;border:0;cursor:pointer">
                    Sign in
                </button>
            </div>

            <div id="dashboard" style="display:none">
                <h3>Welcome to EarnLoop!</h3>
                <p id="userEmail" style="color:#aab7c7;margin-top:8px"></p>

                <div style="background:#08111f;padding:20px;border-radius:12px;margin-top:20px">
                    <p>Available balance</p>
                    <h2 id="balance">$0.00</h2>
                    <p>Total earned:
                        <strong id="lifetime">$0.00</strong>
                    </p>
                </div>

                <h3 style="margin-top:25px">Recent transactions</h3>
                <div id="transactions" style="margin-top:12px">
                    Loading transactions...
                </div>

                <h3 style="margin-top:30px">Sponsored Campaigns</h3>
                <p style="color:#aab7c7;margin:10px 0">
                    Discover opportunities to earn rewards.
                </p>

               
