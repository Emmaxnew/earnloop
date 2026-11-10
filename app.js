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

        <div style="max-width:500px;margin:auto;background:#101d2d;padding:25px;border-radius:14px">

            <div id="authForm">
                <input id="email" type="email" placeholder="Email address"
                style="width:100%;padding:14px;margin-bottom:12px">

                <input id="password" type="password" placeholder="Password"
                style="width:100%;padding:14px;margin-bottom:12px">

                <button id="signup" class="button">Create account</button>
                <button id="login" class="button">Sign in</button>
            </div>

            <div id="dashboard" style="display:none;text-align:left">
                <h3>Welcome to EarnLoop!</h3>
                <p id="userEmail"></p>

                <div style="background:#08111f;padding:20px;border-radius:12px;margin-top:20px">
                    <p>Available balance</p>
                    <h2 id="balance">$0.00</h2>
                    <p>Total earned: <span id="lifetime">$0.00</span></p>
                </div>

                <h3 style="margin-top:25px">Recent transactions</h3>
                <div id="transactions">No transactions yet.</div>

                <button id="refresh" class="button">Refresh balance</button>
                <button id="logout" class="button">Sign out</button>
            </div>

            <p id="message" style="margin-top:18px;color:#35dc91"></p>
        </div>
    `;

    document.querySelector("footer").before(section);

    const message = document.getElementById("message");

    async function loadDashboard() {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            document.getElementById("authForm").style.display = "block";
            document.getElementById("dashboard").style.display = "none";
            return;
        }

        document.getElementById("authForm").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("userEmail").textContent = user.email;

        const { data: account, error } = await supabase
            .from("reward_accounts")
            .select("balance_cents,lifetime_earned_cents")
            .eq("user_id", user.id)
            .single();

        if (error) {
            message.textContent = "Could not load rewards: " + error.message;
            return;
        }

        document.getElementById("balance").textContent =
            "$" + (Number(account.balance_cents) / 100).toFixed(2);

        document.getElementById("lifetime").textContent =
            "$" + (Number(account.lifetime_earned_cents) / 100).toFixed(2);

        const { data: transactions, error: transactionError } =
            await supabase
                .from("reward_transactions")
                .select("amount_cents,transaction_type,description,created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);

        if (transactionError) {
            document.getElementById("transactions").textContent =
                "Could not load transactions.";
            return;
        }

        document.getElementById("transactions").innerHTML =
            transactions.length
                ? transactions.map(item => `
                    <div style="padding:12px 0;border-bottom:1px solid #263c50">
                        <strong>${escapeHTML(item.transaction_type)}</strong>
                        <p>${escapeHTML(item.description || "")}</p>
                        <small>$${(Number(item.amount_cents) / 100).toFixed(2)}</small>
                    </div>
                `).join("")
                : "No transactions yet.";
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    document.getElementById("signup").onclick = async () => {
        const { error } = await supabase.auth.signUp({
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
        });

        message.textContent = error
            ? error.message
            : "Check your email to confirm your account.";
    };

    document.getElementById("login").onclick = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
        });

        message.textContent = error ? error.message : "Signed in successfully!";
        if (!error) await loadDashboard();
    };

    document.getElementById("logout").onclick = async () => {
        await supabase.auth.signOut();
        message.textContent = "You have signed out.";
        await loadDashboard();
    };

    document.getElementById("refresh").onclick = loadDashboard;

    await loadDashboard();
}

startEarnLoop().catch(error => console.error(error));
