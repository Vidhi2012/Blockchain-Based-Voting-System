// =============================================
//  ChainSankalp — candidate-dashboard.js
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    const sessionUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  
    // ── guard: must be logged in ──────────────
    if (!sessionUser) {
      alert("Please sign in to view your profile.");
      window.location.href = "signin.html";
      return;
    }
  
    // ── always pull freshest data from users{} by PRN ──
    // This ensures profilePhoto (base64) and any admin updates (status) are reflected
    const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
    const user     = allUsers[sessionUser.prn] || sessionUser;
  
    // ── subtitle ──────────────────────────────
    const subtitle = document.getElementById("dashSubtitle");
    if (subtitle) {
      subtitle.textContent = ["LR","CS","GS"].includes(user.role)
        ? "Candidate Dashboard"
        : "Voter Profile";
    }
  
    // ── profile image ─────────────────────────
    const img       = document.getElementById("profileImg");
    const avatarUrl = "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(user.name || "User") +
                      "&background=6c63ff&color=fff&size=120";
  
    if (img) {
      // profilePhoto is a base64 data URL: "data:image/jpeg;base64,..."
      const hasPhoto = user.profilePhoto &&
                       user.profilePhoto !== "" &&
                       user.profilePhoto.startsWith("data:");
  
      img.src     = hasPhoto ? user.profilePhoto : avatarUrl;
      img.onerror = () => { img.src = avatarUrl; };
    }
  
    // ── name & PRN ────────────────────────────
    setText("candidateName", user.name       || "—");
    setText("profilePrn",    "PRN: " + (user.prn || "—"));
    setText("position",      roleLabel(user.role));
    setText("department",    user.department || "—");
    setText("year",          user.year       ? "Year " + user.year : "—");
    setText("gender",        user.gender     || "—");
    setText("email",         user.email      || "—");
    setText("achievements",  user.achievements || "No achievements added yet.");
    setText("manifesto",     user.manifesto    || "No manifesto added yet.");
  
    // ── status badge ──────────────────────────
    const badge      = document.getElementById("statusBadge");
    const statusText = document.getElementById("statusText");
  
    if (badge && statusText) {
      const s = user.status || "pending";
      badge.className = "status-badge " + s;
  
      const icon = badge.querySelector("span:first-child");
  
      if (s === "approved") {
        if (icon) icon.textContent = "✅";
        statusText.textContent = "Approved ✓";
  
        // show vote stats for approved candidates
        const statsSection = document.getElementById("voteStatsSection");
        if (statsSection && ["LR","CS","GS"].includes(user.role)) {
          statsSection.style.display = "block";
  
          // pull vote count from localStorage (updated by vote.js)
          const counts   = JSON.parse(localStorage.getItem("voteCounts") || "{}");
          const myVotes  = counts[user.prn] || 0;
          setText("voteCount", myVotes);
        }
  
      } else if (s === "rejected") {
        if (icon) icon.textContent = "❌";
        statusText.textContent = "Rejected";
      } else {
        if (icon) icon.textContent = "⏳";
        statusText.textContent = "Pending Approval";
      }
    }
  
    // ── wallet ────────────────────────────────
    const stored  = localStorage.getItem("walletAddress");
    const addrEl  = document.getElementById("walletAddr");
    const statEl  = document.getElementById("walletStatus");
  
    if (stored && addrEl && statEl) {
      addrEl.textContent = stored.slice(0,6) + "..." + stored.slice(-4);
      statEl.textContent = "Connected";
      statEl.style.background  = "rgba(29,158,117,0.1)";
      statEl.style.color       = "#1D9E75";
      statEl.style.borderColor = "rgba(29,158,117,0.2)";
    }
  
    // ── logout link ───────────────────────────
    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        doLogout();
      });
    }
  });
  
  // =============================================
  //  HELPERS
  // =============================================
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  
  function roleLabel(role) {
    const map = {
      LR:    "LR — Ladies Representative",
      CS:    "CS — Cultural Secretary",
      GS:    "GS — General Secretary",
      voter: "Voter",
      admin: "Admin",
    };
    return map[role] || role || "—";
  }
  
  function doLogout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("walletAddress");
    window.location.href = "signin.html";
  }