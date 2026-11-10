
const SUPABASE_URL = "https://dtuvrvlawbdzoxoydvbx.supabase.co";

// Keep your existing Publishable key here
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
        <h2>Join EarnLoop</h2>
        <p class="subtitle">Create an account or sign in.</p>

        <div style="max-width:400px;margin:auto;background:#101d2d;padding:25px;border-radius:14px">

            <input id="email" type="email" placeholder="Email address"
            style="width:100%;padding:14px;margin-bottom:12px">

            <input id="password" type="password" placeholder="Password"
            style="width:100%;padding:14px;margin-bottom:12px">

            <button id="signup" class="button" style="border:0;cursor:pointer">
                Create account
            </button>

            <button id="login" class="button"
            style="background:#263c50;color:white;border:0;cursor:pointer">
                Sign in
            </button>

            <button id="logout" class="button"
            style="display:none;border:0;cursor:pointer">
                Sign out
            </button>

            <p id="message" style="margin-top:18px;color:#35dc91"></p>
        </div>
    `;

    document.querySelector("footer").before(section);

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const message = document.getElementById("message");

    document.getElementById("signup").onclick = async () => {
        message.textContent = "Creating your account...";

        const { error } = await supabase.auth.signUp({
            email: email.value.trim(),
            password: password.value
        });

        message.textContent = error
            ? error.message
            : "Registration submitted. Check your email if confirmation is required.";
    };

    document.getElementById("login").onclick = async () => {
        message.textContent = "Signing in...";

        const { error } = await supabase.auth.signInWithPassword({
            email: email.value.trim(),
            password: password.value
        });

        message.textContent = error
            ? error.message
            : "Welcome back to EarnLoop!";

        if (!error) updateAccount();
    };

    document.getElementById("logout").onclick = async () => {
        await supabase.auth.signOut();
        updateAccount();
    };

    async function updateAccount() {
        const { data } = await supabase.auth.getUser();
        const loggedIn = !!data.user;

        document.getElementById("signup").style.display =
            loggedIn ? "none" : "inline-block";

        document.getElementById("login").style.display =
            loggedIn ? "none" : "inline-block";

        document.getElementById("logout").style.display =
            loggedIn ? "inline-block" : "none";

        if (loggedIn) {
            message.textContent = "Signed in as " + data.user.email;
        }
    }

    updateAccount();
}

startEarnLoop().catch(error => {
    console.error("EarnLoop error:", error);
});
