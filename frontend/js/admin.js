// =============================================
//  ChainSankalp — Admin Dashboard Logic
// =============================================

// ── GUARD: only admins may enter ─────────────
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!currentUser || currentUser.role !== "admin") {
  alert("Access Denied ❌");
  window.location.href = "signin.html";
}

// ── ADMIN NAME ────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("adminName");
  if (nameEl && currentUser) nameEl.textContent = currentUser.name || "Admin";

  buildOverview();
  buildStudents();
  buildCandidates();
  buildResults();
  buildAudit();
});

// =============================================
//  NAVIGATION
// =============================================
const PANELS = ["overview","students","candidates","results","settings","blockchain","audit"];
const PANEL_TITLES = {
  overview:   "Overview",
  students:   "Student Registry",
  candidates: "Candidates",
  results:    "Election Results",
  settings:   "Settings",
  blockchain: "Blockchain Info",
  audit:      "Audit Log"
};

function showPanel(name, navEl) {
  // hide all panels
  PANELS.forEach(p => {
    const el = document.getElementById("panel-" + p);
    if (el) el.classList.add("hidden");
  });

  // show target
  const target = document.getElementById("panel-" + name);
  if (target) target.classList.remove("hidden");

  // update topbar title
  const titleEl = document.getElementById("topbarTitle");
  if (titleEl) titleEl.textContent = PANEL_TITLES[name] || name;

  // update nav active state
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  if (navEl) navEl.classList.add("active");

  // re-render dynamic panels when visited
  if (name === "students")   renderStudents();
  if (name === "settings")   buildSettingsPanel();
  if (name === "candidates") renderCandidates();
}

// =============================================
//  DATA HELPERS
// =============================================
function getUsers()      { return JSON.parse(localStorage.getItem("users") || "{}"); }
function saveUsers(u)    { localStorage.setItem("users", JSON.stringify(u)); }
function getCandidates() {
  const users = getUsers();
  return Object.values(users).filter(u => ["LR","CS","GS"].includes(u.role));
}

// =============================================
//  OVERVIEW PANEL
// =============================================
function buildOverview() {
  const users = getUsers();
  const all   = Object.values(users);
  const cands = all.filter(u => ["LR","CS","GS"].includes(u.role));
  const pending = cands.filter(c => c.status !== "approved");

  // metric numbers
  setText("m-voters",  all.length);
  setText("m-cands",   cands.length);
  setText("m-pending", pending.length);

  // pending approvals table
  buildPendingTable();

  // vote tally (mock data - replace with blockchain call)
  buildTallyBars([
    { name: "Rohan D.",  votes: 83, color: "#1D9E75" },
    { name: "Sneha P.",  votes: 38, color: "#6c63ff"  },
    { name: "Aditya R.", votes: 13, color: "#BA7517"  },
  ]);

  // activity feed
  buildActivity([
    { dot: "dot-green", text: "Vote cast by PRN 241103**",          time: "2 min ago" },
    { dot: "dot-amber", text: "Candidate Arjun M. registered",      time: "14 min ago" },
    { dot: "dot-blue",  text: "Block #41 mined on-chain",           time: "31 min ago" },
    { dot: "dot-red",   text: "Candidate Dev K. rejected",          time: "1 hr ago" },
    { dot: "dot-green", text: "New voter Tanvi M. registered",      time: "2 hr ago" },
  ]);
}

function buildPendingTable() {
  const tbody  = document.getElementById("pendingTbody");
  if (!tbody) return;
  const cands  = getCandidates().filter(c => c.status !== "approved");

  if (!cands.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-rows">No pending approvals</td></tr>';
    return;
  }

  tbody.innerHTML = cands.slice(0, 5).map(c => `
    <tr>
      <td style="font-weight:500;color:#ddd">${c.name}</td>
      <td><span class="prn">${maskPRN(c.prn)}</span></td>
      <td>${c.role}</td>
      <td>${statusPill(c.status || "pending")}</td>
      <td>
        <button class="approve-btn" onclick="approveUser('${c.prn}')">Approve</button>
        <button class="reject-btn"  onclick="rejectUser('${c.prn}')">Reject</button>
      </td>
    </tr>
  `).join("");
}

function buildTallyBars(data) {
  const el = document.getElementById("tallyBars");
  if (!el) return;
  const max = Math.max(...data.map(d => d.votes), 1);
  el.innerHTML = data.map(d => `
    <div class="vb-row">
      <div class="vb-name">${d.name}</div>
      <div class="vb-track">
        <div class="vb-fill" style="width:${Math.round(d.votes/max*100)}%;background:${d.color}"></div>
      </div>
      <div class="vb-val">${d.votes}</div>
    </div>
  `).join("");
}

function buildActivity(items) {
  const el = document.getElementById("activityFeed");
  if (!el) return;
  el.innerHTML = items.map(i => `
    <div class="activity-item">
      <div class="activity-dot ${i.dot}"></div>
      <div>
        <div class="activity-text">${i.text}</div>
        <div class="activity-time">${i.time}</div>
      </div>
    </div>
  `).join("");
}

// =============================================
//  ELECTION TOGGLE
// =============================================
let elecOn = true;

function toggleElection() {
  elecOn = !elecOn;
  const toggle = document.getElementById("elecToggle");
  const label  = document.getElementById("elecLabel");
  const badge  = document.getElementById("electionBadge");

  if (elecOn) {
    toggle.classList.remove("off");
    label.textContent  = "Voting Enabled";
    badge.textContent  = "● Election Active";
    badge.style.color  = "#1D9E75";
  } else {
    toggle.classList.add("off");
    label.textContent  = "Voting Paused";
    badge.textContent  = "● Election Paused";
    badge.style.color  = "#e9a63a";
  }
}

// =============================================
//  STUDENTS PANEL
// =============================================
const DEPTS     = ["CSE","IT","ETCE","ME","CE","AIML","AR"];
const YEAR_COLORS = ["#378ADD","#63990a","#BA7517","#D4537E"];

let selDept = "All", selYear = "All", selRole = "All";

function buildStudents() {
  renderStudents();
}

function renderStudents() {
  const users = Object.values(getUsers());

  // dept cards
  buildDeptCards(users);
  buildYearCards(users);
  buildChips("deptChips", ["All",...DEPTS],       () => selDept, v => { selDept = v; renderStudents(); });
  buildChips("yearChips", ["All","1","2","3","4"], () => String(selYear), v => { selYear = v==="All"?"All":Number(v); renderStudents(); });
  buildChips("roleChips", ["All","Voter","Candidate"], () => selRole, v => { selRole = v; renderStudents(); });

  const q    = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const rows = users.filter(s => {
    if (selDept !== "All" && s.department !== selDept) return false;
    if (selYear !== "All" && Number(s.year) !== selYear) return false;
    if (selRole === "Voter"     && ["LR","CS","GS"].includes(s.role)) return false;
    if (selRole === "Candidate" && !["LR","CS","GS"].includes(s.role)) return false;
    if (q && !s.name?.toLowerCase().includes(q) && !s.prn?.includes(q)) return false;
    return true;
  });

  const countEl = document.getElementById("rowCount");
  if (countEl) countEl.textContent = `${rows.length} of ${users.length} students`;

  const tbody = document.getElementById("studentTbody");
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="no-rows">No students match the selected filters</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(s => {
    const yr  = Number(s.year) || 1;
    const isC = ["LR","CS","GS"].includes(s.role);
    return `
      <tr>
        <td style="font-weight:500;color:#ddd">${s.name || "—"}</td>
        <td><span class="prn">${maskPRN(s.prn)}</span></td>
        <td>${s.department || "—"}</td>
        <td><span class="year-dot y${yr}">${yr}</span></td>
        <td style="color:#888">${s.gender || "—"}</td>
        <td>${isC ? '<span class="pill pill-cand">Candidate</span>' : '<span class="pill pill-voter">Voter</span>'}</td>
        <td>${statusPill(s.status || "approved")}</td>
      </tr>
    `;
  }).join("");
}

function buildDeptCards(users) {
  const el = document.getElementById("deptCards");
  if (!el) return;
  el.innerHTML = ["All",...DEPTS].map(d => {
    const cnt = d === "All" ? users.length : users.filter(u => u.department === d).length;
    return `
      <div class="dept-card ${selDept===d?"sel":""}" onclick="selDept='${d}';renderStudents()">
        <div class="dept-name">${d}</div>
        <div class="dept-count">${cnt}</div>
        <div class="dept-sub">students</div>
      </div>
    `;
  }).join("");
}

function buildYearCards(users) {
  const el = document.getElementById("yearCards");
  if (!el) return;
  const total = users.length || 1;
  el.innerHTML = [1,2,3,4].map((y,i) => {
    const cnt = users.filter(u => Number(u.year) === y).length;
    const pct = Math.round(cnt/total*100);
    return `
      <div class="year-card ${selYear===y?"sel":""}" onclick="selYear=${selYear===y?'"All"':y};renderStudents()">
        <div class="year-title">Year ${y}</div>
        <div class="year-val">${cnt}</div>
        <div class="year-bar" style="width:${pct}%;background:${YEAR_COLORS[i]}"></div>
      </div>
    `;
  }).join("");
}

function buildChips(containerId, items, getVal, onSelect) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.map(item => `
    <button class="fchip ${getVal()===item?"on":""}" onclick="(${onSelect.toString()})('${item}')">${item}</button>
  `).join("");
}

// =============================================
//  CANDIDATES PANEL
// =============================================
function buildCandidates()  { renderCandidates(); }

function renderCandidates() {
  const cands  = getCandidates();
  const countEl = document.getElementById("candCount");
  if (countEl) countEl.textContent = `${cands.length} total`;

  const tbody = document.getElementById("candTbody");
  if (!tbody) return;

  if (!cands.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="no-rows">No candidates registered yet</td></tr>';
    return;
  }

  tbody.innerHTML = cands.map(c => `
    <tr>
      <td style="font-weight:500;color:#ddd">${c.name}</td>
      <td><span class="prn">${maskPRN(c.prn)}</span></td>
      <td>${c.department || "—"}</td>
      <td><span class="year-dot y${Number(c.year)||1}">${c.year || "—"}</span></td>
      <td>${c.role}</td>
      <td style="color:#888;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.manifesto || "—"}</td>
      <td>${statusPill(c.status || "pending")}</td>
      <td>
        ${c.status !== "approved"
          ? `<button class="approve-btn" onclick="approveUser('${c.prn}')">Approve</button>
             <button class="reject-btn"  onclick="rejectUser('${c.prn}')">Reject</button>`
          : '<span style="color:#555;font-size:11px">—</span>'}
      </td>
    </tr>
  `).join("");
}

// =============================================
//  APPROVE / REJECT
// =============================================
function approveUser(prn) {
  const users = getUsers();
  if (!users[prn]) return;
  users[prn].status = "approved";
  saveUsers(users);
  // refresh both tables
  buildPendingTable();
  renderCandidates();
  buildOverview();
  alert(`✅ ${users[prn].name} approved!`);
}

function rejectUser(prn) {
  const users = getUsers();
  if (!users[prn]) return;
  users[prn].status = "rejected";
  saveUsers(users);
  buildPendingTable();
  renderCandidates();
  buildOverview();
  alert(`❌ ${users[prn].name} rejected.`);
}

// =============================================
//  RESULTS PANEL
// =============================================
function buildResults() {
  // Replace this mock data with real blockchain vote counts
  const data = [
    { name: "Rohan Desai",  role: "GS", votes: 83, color: "#1D9E75" },
    { name: "Sneha Patil",  role: "LR", votes: 38, color: "#6c63ff"  },
    { name: "Aditya Rane",  role: "CS", votes: 13, color: "#BA7517"  },
  ];
  const max = Math.max(...data.map(d => d.votes), 1);
  const el  = document.getElementById("resultsBars");
  if (!el) return;

  el.innerHTML = data.map((d,i) => `
    <div class="vb-row" style="padding:12px 18px">
      <div style="display:flex;align-items:center;gap:8px;width:160px;flex-shrink:0">
        <div style="width:22px;height:22px;border-radius:50%;background:${d.color}22;color:${d.color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${i+1}</div>
        <div>
          <div style="font-size:12px;font-weight:500;color:#ddd">${d.name}</div>
          <div style="font-size:10px;color:#555">${d.role}</div>
        </div>
      </div>
      <div class="vb-track">
        <div class="vb-fill" style="width:${Math.round(d.votes/max*100)}%;background:${d.color}"></div>
      </div>
      <div class="vb-val" style="color:${d.color}">${d.votes}</div>
    </div>
  `).join("");
}

// =============================================
//  AUDIT LOG
// =============================================
function buildAudit() {
  const tbody = document.getElementById("auditTbody");
  if (!tbody) return;

  const logs = [
    { time: "5:02 PM", event: "Vote Cast",          prn: "241103**", detail: "Block #41 recorded" },
    { time: "4:48 PM", event: "Candidate Registered",prn: "241103**", detail: "Role: GS, Dept: CSE" },
    { time: "4:31 PM", event: "Block Mined",         prn: "—",        detail: "Block #40, Gas: 0.001 ETH" },
    { time: "4:20 PM", event: "Candidate Rejected",  prn: "241102**", detail: "Role: LR" },
    { time: "3:55 PM", event: "Voter Registered",    prn: "241103**", detail: "Dept: IT, Year: 2" },
    { time: "3:40 PM", event: "Election Started",    prn: "Admin",    detail: "Contract deployed" },
  ];

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td class="prn">${l.time}</td>
      <td style="color:#ddd;font-weight:500">${l.event}</td>
      <td><span class="prn">${l.prn}</span></td>
      <td style="color:#888">${l.detail}</td>
    </tr>
  `).join("");
}


// =============================================
//  SETTINGS PANEL — per-election schedule
// =============================================
function buildSettingsPanel() {
  const el = document.getElementById("settingsPanelContent");
  if (!el) return;

  const saved    = JSON.parse(localStorage.getItem("electionSchedule") || "{}");
  const roles    = ["LR","CS","GS"];
  const fullName = { LR:"Ladies Representative", CS:"Cultural Secretary", GS:"General Secretary" };

  el.innerHTML = `
    <div style="max-width:580px">
      <div class="panel" style="margin-bottom:18px">
        <div class="panel-header"><span class="panel-title">Election Schedule</span></div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:0">
          ${roles.map(role => {
            const s = saved[role] || {};
            return `
              <div style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  <div style="width:36px;height:36px;border-radius:10px;background:rgba(108,99,255,0.12);
                    border:1px solid rgba(108,99,255,0.25);display:flex;align-items:center;
                    justify-content:center;font-size:12px;font-weight:700;color:#a09aff">${role}</div>
                  <div>
                    <div style="font-size:13px;font-weight:600;color:#ddd">${fullName[role]}</div>
                    <div style="font-size:11px;color:#555" id="status-${role}"></div>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                  <div>
                    <div style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">Start</div>
                    <input class="setting-input" type="datetime-local"
                      id="start-${role}" value="${s.start || ""}"
                      onchange="updateScheduleStatus('${role}')"/>
                  </div>
                  <div>
                    <div style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">End</div>
                    <input class="setting-input" type="datetime-local"
                      id="end-${role}" value="${s.end || ""}"
                      onchange="updateScheduleStatus('${role}')"/>
                  </div>
                </div>
              </div>`;
          }).join("")}
          <div style="padding-top:16px">
            <button class="save-btn" onclick="saveSchedule()">Save Schedule</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><span class="panel-title">General Settings</span></div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:0">
          <div class="setting-row">
            <div><div class="setting-label">Election Title</div><div class="setting-sub">Shown on all pages</div></div>
            <input class="setting-input" type="text" id="electionTitle"
              value="${localStorage.getItem('electionTitle') || 'Student Council Election 2026'}"/>
          </div>
          <div class="setting-row bt">
            <div><div class="setting-label">Show Live Results</div><div class="setting-sub">Visible to all students</div></div>
            <div class="toggle-on"></div>
          </div>
          <div style="padding-top:16px">
            <button class="save-btn" onclick="saveGeneralSettings()">Save General Settings</button>
          </div>
        </div>
      </div>
    </div>`;

  // update status labels
  roles.forEach(r => updateScheduleStatus(r));
}

function updateScheduleStatus(role) {
  const startVal = document.getElementById("start-" + role)?.value;
  const endVal   = document.getElementById("end-"   + role)?.value;
  const label    = document.getElementById("status-" + role);
  if (!label) return;

  if (!startVal || !endVal) { label.textContent = "Not scheduled"; return; }

  const now   = new Date();
  const start = new Date(startVal);
  const end   = new Date(endVal);

  if (now < start) label.textContent = "⏳ Upcoming";
  else if (now > end) label.textContent = "✅ Ended";
  else label.textContent = "● Active now";
}

function saveSchedule() {
  const roles    = ["LR","CS","GS"];
  const schedule = {};
  roles.forEach(role => {
    schedule[role] = {
      start: document.getElementById("start-" + role)?.value || null,
      end:   document.getElementById("end-"   + role)?.value || null,
    };
  });
  localStorage.setItem("electionSchedule", JSON.stringify(schedule));
  alert("Schedule saved ✅");
  roles.forEach(r => updateScheduleStatus(r));
}

function saveGeneralSettings() {
  const title = document.getElementById("electionTitle")?.value;
  if (title) localStorage.setItem("electionTitle", title);
  alert("Settings saved ✅");
}

// =============================================
//  UTILS
// =============================================
function statusPill(status) {
  const map = {
    approved: '<span class="pill pill-approved">Approved</span>',
    pending:  '<span class="pill pill-pending">Pending</span>',
    rejected: '<span class="pill pill-rejected">Rejected</span>',
  };
  return map[status] || map.pending;
}

function maskPRN(prn) {
  if (!prn) return "—";
  return prn.slice(0, 8) + "****";
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// =============================================
//  LOGOUT
// =============================================
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "signin.html";
}