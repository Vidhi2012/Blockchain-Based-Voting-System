// =============================================
//  ChainSankalp — app.js
//  Runs on every page: navbar state + wallet
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  
    const loginLink   = document.getElementById("loginLink");
    const profileBtn  = document.getElementById("profileBtn");
    const logoutBtn   = document.getElementById("logoutBtn");
    const voteLink    = document.getElementById("voteLink");
    const voteHeroBtn = document.getElementById("voteHeroBtn");
    const connectBtn  = document.getElementById("connectWallet");
    const logoText    = document.getElementById("logoText");
  
    // ── navbar state ──────────────────────────
    if (loginLink)  loginLink.style.display  = user ? "none"         : "inline-block";
    if (profileBtn) profileBtn.style.display = user ? "inline-block" : "none";
    if (logoutBtn)  logoutBtn.style.display  = user ? "inline-block" : "none";
  
    // Vote link — only visible when logged in
    if (voteLink)    voteLink.style.display  = user ? "inline-block" : "none";
  
    // Hero: swap Connect Wallet → Cast Your Vote when already logged in
    if (user) {
      if (connectBtn)  connectBtn.style.display  = "none";
      if (voteHeroBtn) voteHeroBtn.style.display = "inline-flex";
    } else {
      if (connectBtn)  connectBtn.style.display  = "inline-block";
      if (voteHeroBtn) voteHeroBtn.style.display = "none";
    }
  
    // profile click → correct dashboard
    if (profileBtn && user) {
      profileBtn.onclick = (e) => {
        e.preventDefault();
        if (["LR","CS","GS"].includes(user.role)) {
          window.location.href = "candidate-dashboard.html";
        } else if (user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "voter_dashboard.html";
        }
      };
    }
  
    // ── restore wallet display ─────────────────
    const stored = localStorage.getItem("walletAddress");
    if (stored) showWalletAddress(stored);
  });
  
  // =============================================
  //  WALLET CONNECT
  // =============================================
  async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask not found. Please install MetaMask to continue.");
      return;
    }
  
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address  = accounts[0];
      localStorage.setItem("walletAddress", address);
      showWalletAddress(address);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Wallet connection cancelled.");
    }
  }
  
  function showWalletAddress(address) {
    const el  = document.getElementById("walletAddress");
    const btn = document.getElementById("connectWallet");
  
    if (el) {
      el.textContent = `🦊 ${address.slice(0,6)}...${address.slice(-4)}`;
      el.style.display = "block";
    }
    if (btn) {
      btn.textContent = "Wallet Connected ✓";
      btn.style.background = "linear-gradient(135deg, #1D9E75, #00d4ff)";
    }
  }
  
  // =============================================
  //  LOGOUT
  // =============================================
  function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("walletAddress");
    window.location.href = "signin.html";
  }
