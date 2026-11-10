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
                    style="width:100%;padding:14px;margin:10px 0">

                <input id="password" type="password"
                    placeholder="Password"
                    style="width:100%;padding:14px;margin:10px 0">

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
                <p id="userEmail" style="color:#aab7c7"></p>

                <div style="background:#08111f;padding:20px;border-radius:12px;margin-top:20px">
                    <p>Available balance</p>
                    <h2 id="balance">$0.00</h2>
                    <p>Total earned:
                        <strong id="lifetime">$0.00</strong>
                    </p>
                </div>

                <h3 style="margin-top:25px">Recent transactions</h3>
                <div id="transactions">Loading...</div>

                <h3 style="margin-top:30px">Sponsored Campaigns</h3>
                <p style="color:#aab7c7">
                    Discover available opportunities.
                </p>
                <div id="campaigns">Loading campaigns...</div>

                <button id="refresh" class="button"
                    style="border:0;cursor:pointer">
                    Refresh balance
                </button>

                <button id="logout" class="button"
                    style="background:#263c50;color:white;border:0;cursor:pointer">
                    Sign out
                </button>
            </div>

            <p id="message" style="color:#35dc91;margin-top:18px"></p>
        </div>
    `;

    document.querySelector("footer").before(section);

    const $ = id => document.getElementById(id);
    const message = $("message");

    function showMessage(text) {
        message.textContent = text;
    }

    function money(cents) {
        return "$" + (Number(cents || 0) / 100).toFixed(2);
    }

    function addText(parent, tag, text) {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.appendChild(element);
        return element;
    }

    async function loadDashboard() {
        const { data: { user }, error } =
            await supabase.auth.getUser();

        if (error) {
            showMessage(error.message);
            return;
        }

        if (!user) {
            $("authForm").style.display = "block";
            $("dashboard").style.display = "none";
            showMessage("");
            return;
        }

        $("authForm").style.display = "none";
        $("dashboard").style.display = "block";
        $("userEmail").textContent = user.email;

        showMessage("Loading your account...");

        // Load reward account
        const { data: account, error: accountError } =
            await supabase
                .from("reward_accounts")
                .select("balance_cents,lifetime_earned_cents")
                .eq("user_id", user.id)
                .maybeSingle();

        if (accountError) {
            showMessage("Could not load rewards: " + accountError.message);
        } else if (!account) {
            showMessage("Your reward account has not been created yet.");
        } else {
            $("balance").textContent = money(account.balance_cents);
            $("lifetime").textContent =
                money(account.lifetime_earned_cents);
            showMessage("");
        }

        // Load transactions
        const txBox = $("transactions");
        txBox.replaceChildren();

        const { data: transactions, error: txError } =
            await supabase
                .from("reward_transactions")
                .select("amount_cents,transaction_type,description,created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);

        if (txError) {
            addText(txBox, "p", "Could not load transactions.");
        } else if (!transactions || transactions.length === 0) {
            addText(txBox, "p", "No transactions yet.");
        } else {
            transactions.forEach(item => {
                const row = document.createElement("div");
                row.style.cssText =
                    "padding:12px 0;border-bottom:1px solid #263c50";

                addText(row, "strong",
                    item.transaction_type || "Transaction");

                addText(row, "p", item.description || "");

                addText(row, "small", money(item.amount_cents));

                txBox.appendChild(row);
            });
        }

        // Load active campaigns
        const campaignBox = $("campaigns");
        campaignBox.replaceChildren();

        const { data: campaigns, error: campaignError } =
            await supabase
                .from("campaigns")
                .select("id,title,description,advertiser_name,reward_cents")
                .eq("status", "active")
                .order("created_at", { ascending: false });

        if (campaignError) {
            addText(campaignBox, "p", "Could not load campaigns.");
        } else if (!campaigns || campaigns.length === 0) {
            addText(campaignBox, "p",
                "No sponsored campaigns available yet.");
        } else {
            campaigns.forEach(campaign => {
                const card = document.createElement("div");

                card.style.cssText =
                    "background:#08111f;padding:18px;border-radius:12px;margin:12px 0";

                addText(card, "h3", campaign.title);
                addText(card, "p", campaign.description || "");
                addText(card, "p",
                    campaign.advertiser_name || "Sponsored");

                addText(card, "strong",
                    "Listed reward: " + money(campaign.reward_cents));

                campaignBox.appendChild(card);
            });
        }
    }

    $("signup").onclick = async () => {
        const email = $("email").value.trim();
        const password = $("password").value;

        if (!email || password.length < 8) {
            showMessage("Enter a valid email and password of at least 8 characters.");
            return;
        }

        showMessage("Creating account...");

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: "https://earnloop.pages.dev/"
            }
        });

        showMessage(error
            ? error.message
            : "Account created! Check your email for confirmation.");
    };

    $("login").onclick = async () => {
        showMessage("Signing in...");

        const { error } = await supabase.auth.signInWithPassword({
            email: $("email").value.trim(),
            password: $("password").value
        });

        if (error) {
            showMessage(error.message);
        } else {
            await loadDashboard();
        }
    };

    $("logout").onclick = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            showMessage(error.message);
        } else {
            await loadDashboard();
        }
    };

    $("refresh").onclick = loadDashboard;

    await loadDashboard();

    supabase.auth.onAuthStateChange(() => {
        setTimeout(loadDashboard, 0);
    });
}

startEarnLoop().catch(error => {
    console.error("EarnLoop error:", error);
    document.body.insertAdjacentHTML(
        "beforeend",
        '<p style="color:red;text-align:center">EarnLoop could not start. Please refresh.</p>'
    );
});

               
