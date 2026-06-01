// =============================================
//  ChainSankalp — voter-dashboard.js
// =============================================

const ROLES = ["LR", "CS", "GS"];

const ROLE_INFO = {
  LR: { full: "Ladies Representative",  desc: "Represents the interests and welfare of women students" },
  CS: { full: "Cultural Secretary",      desc: "Organises cultural events, fests, and creative activities" },
  GS: { full: "General Secretary",       desc: "Leads the student council and represents all students" },
};

document.addEventListener("DOMContentLoaded", () => {

  // ── auth guard ────────────────────────────
  const sessionUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (!sessionUser) {
    alert("Please sign in to continue.");
    window.location.href = "signin.html";
    return;
  }

  // ── always use freshest user data ─────────
  const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
  const user     = allUsers[sessionUser.prn] || sessionUser;

  // ── fill profile card ─────────────────────
  const avatarUrl = "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(user.name || "User") + "&background=6c63ff&color=fff&size=80";

  const imgEl = document.getElementById("voterImg");
  if (imgEl) {
    imgEl.src     = (user.profilePhoto && user.profilePhoto.startsWith("data:"))
                    ? user.profilePhoto : avatarUrl;
    imgEl.onerror = () => { imgEl.src = avatarUrl; };
  }

  setText("voterName",   user.name       || "—");
  setText("voterPrn",    "PRN: " + (user.prn || "—"));
  setText("voterDept",   user.department  || "—");
  setText("voterYear",   user.year ? "Year " + user.year : "—");
  setText("voterGender", user.gender      || "—");

  // ── vote status ───────────────────────────
  const votedKey  = "voted_" + user.prn;
  const voteData  = JSON.parse(localStorage.getItem(votedKey) || "null");
  const statusWrap = document.getElementById("voteStatusWrap");

  if (voteData) {
    statusWrap?.classList.add("voted");
    setText("vsIcon",  "✅");
    setText("vsLabel", "Voted");
  }

  // ── election schedule chips ───────────────
  buildElectionChips();

  // ── candidate sections ────────────────────
  buildCandidateSections(voteData);
});

// =============================================
//  ELECTION SCHEDULE
//  Stored in localStorage by admin settings panel
//  Format: { LR: {start, end}, CS: {start, end}, GS: {start, end} }
// =============================================
function getSchedule() {
  const defaults = {
    LR: { start: null, end: null },
    CS: { start: null, end: null },
    GS: { start: null, end: null },
  };
  const saved = localStorage.getItem("electionSchedule");
  return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
}

function getElectionStatus(role) {
  const schedule = getSchedule();
  const s = schedule[role];

  if (!s || !s.start || !s.end) return { status: "upcoming", label: "Not Scheduled" };

  const now   = new Date();
  const start = new Date(s.start);
  const end   = new Date(s.end);

  if (now < start) return { status: "upcoming", label: "Starts " + formatDate(start) };
  if (now > end)   return { status: "ended",    label: "Ended "  + formatDate(end) };
  return             { status: "active",    label: "Ends "   + formatDate(end) };
}

function buildElectionChips() {
  const container = document.getElementById("electionChips");
  if (!container) return;

  container.innerHTML = ROLES.map(role => {
    const { status, label } = getElectionStatus(role);
    const statusClass = `e-status-${status}`;
    const statusText  = status === "active" ? "● Active" : status === "upcoming" ? "Upcoming" : "Ended";

    return `
      <div class="e-chip">
        <span class="e-chip-role">${role}</span>
        <span class="e-chip-name">${ROLE_INFO[role].full}</span>
        <span class="e-chip-status ${statusClass}">${statusText}</span>
        <span class="e-chip-time">${label}</span>
      </div>`;
  }).join("");
}

// =============================================
//  CANDIDATE SECTIONS
// =============================================
function buildCandidateSections(voteData) {
  const container = document.getElementById("vdSections");
  if (!container) return;

  const allUsers   = JSON.parse(localStorage.getItem("users") || "{}");
  const voteCounts = JSON.parse(localStorage.getItem("voteCounts") || "{}");

  container.innerHTML = ROLES.map(role => {
    const { status, label } = getElectionStatus(role);
    const candidates = Object.values(allUsers).filter(
      u => u.role === role && u.status === "approved"
    );

    const statusClass = `e-status-${status}`;
    const statusText  = status === "active" ? "● Active" : status === "upcoming" ? "Upcoming" : "Ended";

    // which candidate did this voter pick for this role?
    const myPick = voteData?.choices?.[role] || null;

    const cardsHtml = candidates.length
      ? candidates.map(c => buildCandCard(c, role, myPick)).join("")
      : `<div class="vd-no-cands">No approved candidates for ${role} yet.</div>`;

    return `
      <div class="vd-section">
        <div class="vd-section-header">
          <div class="vd-section-left">
            <div class="vd-role-badge">${role}</div>
            <div>
              <div class="vd-section-title">${ROLE_INFO[role].full}</div>
              <div class="vd-section-desc">${ROLE_INFO[role].desc}</div>
            </div>
          </div>
          <span class="vd-section-badge e-chip-status ${statusClass}">${statusText} — ${label}</span>
        </div>
        <div class="vd-cand-grid">${cardsHtml}</div>
      </div>`;
  }).join("");
}

function buildCandCard(c, role, myPick) {
  const avatarUrl = "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(c.name) + "&background=6c63ff&color=fff&size=60";

  const photo = (c.profilePhoto && c.profilePhoto.startsWith("data:"))
    ? c.profilePhoto : avatarUrl;

  const isMyVote = myPick === c.prn;

  return `
    <div class="vd-cand-card">
      <img class="vd-cand-photo" src="${photo}" alt="${c.name}"
           onerror="this.src='${avatarUrl}'"/>
      <div class="vd-cand-name">${c.name}</div>
      <div class="vd-cand-meta">${c.department || "—"} &nbsp;·&nbsp; Year ${c.year || "—"}</div>
      <div class="vd-cand-manifesto">${c.manifesto || "No manifesto provided."}</div>
      ${isMyVote ? '<div class="vd-voted-chip">✓ Your Vote</div>' : ""}
    </div>`;
}

// =============================================
//  UTILS
// =============================================
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatDate(date) {
  return date.toLocaleString("en-IN", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true
  });
}