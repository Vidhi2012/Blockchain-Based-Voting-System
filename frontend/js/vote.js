// =============================================
//  ChainSankalp — vote.js
//  Handles the full multi-step voting flow
// =============================================

// ── state ─────────────────────────────────────
const selections = { LR: null, CS: null, GS: null };
const ROLES      = ["LR", "CS", "GS"];
let   lastTxHash = null;


// =============================================
//  ELECTION SCHEDULE HELPERS
// =============================================
function getSchedule() {
  const saved = localStorage.getItem("electionSchedule");
  return saved ? JSON.parse(saved) : { LR: {}, CS: {}, GS: {} };
}

function isElectionActive(role) {
  const s = getSchedule()[role];
  if (!s || !s.start || !s.end) return false;
  const now = new Date();
  return now >= new Date(s.start) && now <= new Date(s.end);
}

function activeRoles() {
  return ROLES.filter(r => isElectionActive(r));
}

// ── init ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // 1. Auth guard — must be logged in
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (!user) {
    alert("Please sign in to vote.");
    window.location.href = "signin.html";
    return;
  }

  // 2. Already voted?
  const votedKey = "voted_" + user.prn;
  if (localStorage.getItem(votedKey)) {
    showAlreadyVotedOverlay(user);
    return;
  }

  // 3. Wallet chip
  const wallet = localStorage.getItem("walletAddress");
  const chip   = document.getElementById("walletChip");
  const chipTx = document.getElementById("walletChipText");

  if (wallet && chip && chipTx) {
    chipTx.textContent = wallet.slice(0,6) + "..." + wallet.slice(-4);
    chip.querySelector(".chip-dot").className = "chip-dot dot-green";
  }

  // 4. Load candidates into each role grid
  loadCandidates();
});

// =============================================
//  LOAD CANDIDATES
// =============================================
function loadCandidates() {
  const users      = JSON.parse(localStorage.getItem("users") || "{}");
  const candidates = Object.values(users).filter(
    u => ROLES.includes(u.role) && u.status === "approved"
  );

  ROLES.forEach(role => {
    const grid   = document.getElementById("grid-" + role);
    if (!grid) return;

    // Check if this election is currently active
    if (!isElectionActive(role)) {
      const s = getSchedule()[role];
      const now = new Date();
      let msg = "This election has not been scheduled yet.";

      if (s && s.start) {
        const start = new Date(s.start);
        const end   = new Date(s.end);
        if (now < start) {
          msg = `Voting opens on ${start.toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit", hour12:true })}`;
        } else if (now > end) {
          msg = `Voting for this position ended on ${end.toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit", hour12:true })}`;
        }
      }

      grid.innerHTML = `
        <div class="no-candidates">
          <div style="font-size:24px;margin-bottom:10px">🔒</div>
          ${msg}
        </div>`;

      // disable next button for this step
      const panel = document.getElementById("panel-" + role);
      if (panel) {
        const nextBtn = panel.querySelector(".btn-next");
        if (nextBtn) {
          nextBtn.disabled = true;
          nextBtn.style.opacity = "0.4";
          nextBtn.title = "Election not active";
        }
      }
      return;
    }

    const roleCands = candidates.filter(c => c.role === role);

    if (!roleCands.length) {
      grid.innerHTML = `
        <div class="no-candidates">
          No approved candidates for ${role} yet.<br/>
          <span style="font-size:11px;color:#444">Check back after admin approvals.</span>
        </div>`;
      return;
    }

    grid.innerHTML = roleCands.map(c => buildCandCard(c, role)).join("");
  });
}

function buildCandCard(c, role) {
  const photo = c.profilePhoto && c.profilePhoto !== ""
    ? c.profilePhoto
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=6c63ff&color=fff&size=80`;

  return `
    <div class="cand-card" id="card-${role}-${c.prn}" onclick="selectCandidate('${role}', '${c.prn}')">
      <img class="cand-photo" src="${photo}" alt="${c.name}"
           onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=6c63ff&color=fff&size=80'"/>
      <div class="cand-name">${c.name}</div>
      <div class="cand-meta">${c.department || "—"} &nbsp;·&nbsp; Year ${c.year || "—"}</div>
      <div class="cand-manifesto">${c.manifesto || "No manifesto provided."}</div>
    </div>
  `;
}

// =============================================
//  SELECT CANDIDATE
// =============================================
function selectCandidate(role, prn) {
  // deselect previous
  if (selections[role]) {
    const prev = document.getElementById(`card-${role}-${selections[role]}`);
    if (prev) prev.classList.remove("selected");
  }

  // select new
  selections[role] = prn;
  const card = document.getElementById(`card-${role}-${prn}`);
  if (card) card.classList.add("selected");
}

// =============================================
//  STEP NAVIGATION
// =============================================
const STEP_ORDER = ["LR", "CS", "GS", "confirm"];

function goNext(currentRole, nextPanel) {
  // Validate: must have selected a candidate (optional — remove if you want to allow skipping)
  if (ROLES.includes(currentRole) && !selections[currentRole]) {
    const confirmSkip = confirm(
      `You haven't selected a candidate for ${currentRole}.\n\nSkip this position and continue?`
    );
    if (!confirmSkip) return;
  }

  hidePanel(currentRole);
  showPanel(nextPanel);
  updateProgress(nextPanel);

  // Build review when reaching confirm
  if (nextPanel === "confirm") buildReview();
}

function goBack(currentPanel, prevRole) {
  hidePanel(currentPanel);
  showPanel(prevRole);
  updateProgress(prevRole);
}

function hidePanel(name) {
  const el = document.getElementById("panel-" + name);
  if (el) el.classList.add("hidden");
}

function showPanel(name) {
  const el = document.getElementById("panel-" + name);
  if (el) {
    el.classList.remove("hidden");
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateProgress(active) {
  const order = STEP_ORDER; // ["LR","CS","GS","confirm"]
  const activeIdx = order.indexOf(active);

  order.forEach((step, i) => {
    const stepEl = document.getElementById("step-" + step);
    const lineEl = stepEl?.nextElementSibling; // .vp-line after each step

    if (!stepEl) return;

    if (i < activeIdx) {
      stepEl.classList.remove("active");
      stepEl.classList.add("done");
      stepEl.querySelector(".vp-circle").textContent = "✓";
      if (lineEl && lineEl.classList.contains("vp-line")) lineEl.classList.add("done");
    } else if (i === activeIdx) {
      stepEl.classList.add("active");
      stepEl.classList.remove("done");
    } else {
      stepEl.classList.remove("active", "done");
    }
  });
}

// =============================================
//  BUILD REVIEW SCREEN
// =============================================
function buildReview() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const grid  = document.getElementById("reviewGrid");
  if (!grid) return;

  grid.innerHTML = ROLES.map(role => {
    const prn  = selections[role];
    const cand = prn ? users[prn] : null;

    if (!cand) {
      return `
        <div class="review-card">
          <div class="review-role">${role}</div>
          <div class="review-none">No candidate selected</div>
        </div>`;
    }

    const photo = cand.profilePhoto && cand.profilePhoto !== ""
      ? cand.profilePhoto
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=6c63ff&color=fff&size=60`;

    return `
      <div class="review-card">
        <div class="review-role">${role} — ${roleFullName(role)}</div>
        <img class="review-photo" src="${photo}" alt="${cand.name}"
             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=6c63ff&color=fff&size=60'"/>
        <div class="review-name">${cand.name}</div>
        <div class="review-meta">${cand.department || "—"} · Year ${cand.year || "—"}</div>
      </div>`;
  }).join("");
}

// =============================================
//  SUBMIT VOTE
// =============================================
async function submitVote() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (!user) { window.location.href = "signin.html"; return; }

  const btn     = document.getElementById("submitBtn");
  const btnText = document.getElementById("submitBtnText");

  // ── check wallet ──────────────────────────
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not found. Please install MetaMask to vote.");
    return;
  }

  // ── disable button ────────────────────────
  btn.disabled  = true;
  btnText.textContent = "Connecting to MetaMask…";

  try {
    // 1. Request accounts
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const account  = accounts[0];
    localStorage.setItem("walletAddress", account);

    btnText.textContent = "Sending transaction…";

    // ── BLOCKCHAIN CALL ───────────────────────────────────────────────────────
    // Replace the block below with your actual smart contract call, e.g.:
    //
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const signer   = provider.getSigner();
    //   const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    //   const tx       = await contract.castVote(
    //     selections.LR || "",
    //     selections.CS || "",
    //     selections.GS || ""
    //   );
    //   await tx.wait();
    //   const txHash = tx.hash;
    //
    // For now we simulate a MetaMask personal_sign as a stand-in:
    // ─────────────────────────────────────────────────────────────────────────

    const votePayload = JSON.stringify({
      voter: user.prn,
      choices: selections,
      timestamp: new Date().toISOString()
    });

    // personal_sign acts as proof-of-intent; replace with contract call in production
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [votePayload, account]
    });

    // Simulated tx hash (replace with real tx.hash from contract call)
    const fakeTxHash  = "0x" + [...Array(64)].map(() => Math.floor(Math.random()*16).toString(16)).join("");
    const fakeBlock   = Math.floor(Math.random() * 10000) + 7000000;

    lastTxHash = fakeTxHash;

    // ── mark as voted ─────────────────────────
    localStorage.setItem("voted_" + user.prn, JSON.stringify({
      txHash:    fakeTxHash,
      block:     fakeBlock,
      choices:   selections,
      timestamp: new Date().toISOString()
    }));

    // ── update vote counts (localStorage) ─────
    recordVoteCounts();

    // ── show success ──────────────────────────
    showSuccess(fakeTxHash, fakeBlock, user);

  } catch (err) {
    console.error("Vote submission error:", err);

    if (err.code === 4001) {
      alert("Transaction rejected. Please approve the MetaMask request to cast your vote.");
    } else {
      alert("Something went wrong: " + (err.message || "Unknown error"));
    }

    btn.disabled        = false;
    btnText.textContent = "Submit Vote via MetaMask";
  }
}

// =============================================
//  RECORD VOTE COUNTS (localStorage)
// =============================================
function recordVoteCounts() {
  const counts = JSON.parse(localStorage.getItem("voteCounts") || "{}");

  ROLES.forEach(role => {
    const prn = selections[role];
    if (!prn) return;
    counts[prn] = (counts[prn] || 0) + 1;
  });

  localStorage.setItem("voteCounts", JSON.stringify(counts));
}

// =============================================
//  SUCCESS SCREEN
// =============================================
function showSuccess(txHash, block, user) {
  // hide confirm panel
  hidePanel("confirm");

  // fill success data
  const short = txHash.slice(0,10) + "..." + txHash.slice(-8);
  setText("txHash",  short);
  setText("txBlock", "#" + block);
  setText("txPrn",   maskPRN(user.prn));
  setText("txTime",  new Date().toLocaleString("en-IN"));

  // voted choices summary
  const usersMap   = JSON.parse(localStorage.getItem("users") || "{}");
  const choicesEl  = document.getElementById("successChoices");

  if (choicesEl) {
    choicesEl.innerHTML = ROLES.map(role => {
      const prn  = selections[role];
      const cand = prn ? usersMap[prn] : null;
      if (!cand) return "";
      return `
        <div class="sc-chip">
          <span class="sc-role">${role}</span>
          <span>${cand.name}</span>
        </div>`;
    }).join("");
  }

  showPanel("success");

  // update progress — all done
  STEP_ORDER.forEach(step => {
    const el = document.getElementById("step-" + step);
    if (el) {
      el.classList.remove("active");
      el.classList.add("done");
      const circle = el.querySelector(".vp-circle");
      if (circle) circle.textContent = "✓";
    }
    const line = el?.nextElementSibling;
    if (line && line.classList.contains("vp-line")) line.classList.add("done");
  });
}

// =============================================
//  ALREADY VOTED OVERLAY
// =============================================
function showAlreadyVotedOverlay(user) {
  const voteData = JSON.parse(localStorage.getItem("voted_" + user.prn) || "{}");

  const overlay = document.createElement("div");
  overlay.className = "voted-overlay";
  overlay.innerHTML = `
    <div class="voted-box">
      <div style="font-size:48px">🗳️</div>
      <h3>You've Already Voted</h3>
      <p>
        Your vote was recorded on the blockchain.<br/>
        Each student may only vote once.
      </p>
      ${voteData.txHash ? `
        <div style="margin-top:16px;font-family:'Courier New',monospace;font-size:11px;color:#555;
          background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);
          border-radius:8px;padding:10px 14px;word-break:break-all">
          Tx: ${voteData.txHash}
        </div>` : ""}
      <button class="btn-primary" onclick="window.location.href='index.html'"
        style="margin-top:20px;font-family:'Poppins',sans-serif">
        Back to Home
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  // also show chip
  const chip = document.getElementById("alreadyVotedChip");
  if (chip) chip.style.display = "inline-flex";
}

// =============================================
//  VIEW ON EXPLORER
// =============================================
function viewOnExplorer() {
  if (!lastTxHash) return;
  // Sepolia explorer
  window.open(`https://sepolia.etherscan.io/tx/${lastTxHash}`, "_blank");
}

// =============================================
//  UTILS
// =============================================
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function maskPRN(prn) {
  if (!prn) return "—";
  return prn.slice(0, 6) + "****" + prn.slice(-2);
}

function roleFullName(role) {
  return { LR: "Ladies Representative", CS: "Cultural Secretary", GS: "General Secretary" }[role] || role;
}