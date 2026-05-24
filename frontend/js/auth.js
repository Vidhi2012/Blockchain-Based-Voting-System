// =============================================
//  ChainSankalp — auth.js
//  Handles signup + signin
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    // ── toggle candidate fields based on role ──
    const roleSelect = document.getElementById("role");
    const candFields = document.getElementById("candidateFields");
  
    if (roleSelect && candFields) {
      function toggleCandidateFields() {
        const isCandidate = ["LR","CS","GS"].includes(roleSelect.value);
        candFields.style.display = isCandidate ? "block" : "none";
      }
      toggleCandidateFields();
      roleSelect.addEventListener("change", toggleCandidateFields);
    }
  
    // =============================================
    //  SIGNUP
    // =============================================
    const signupForm = document.getElementById("signupForm");
  
    if (signupForm) {
      signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();
  
        const name     = document.getElementById("name").value.trim();
        const prn      = document.getElementById("prn").value.trim();
        const phone    = document.getElementById("phone").value.trim();
        const email    = document.getElementById("email").value.trim();
        const gender   = document.getElementById("gender").value;
        const dept     = document.getElementById("department").value;
        const year     = document.getElementById("year").value;
        const role     = document.getElementById("role").value;
        const password = document.getElementById("password").value;
        const confirm  = document.getElementById("confirmPassword").value;
  
        // ── validations ──
        if (prn.length !== 14) {
          return alert("PRN must be exactly 14 digits.");
        }
        if (phone.length !== 10 || isNaN(phone)) {
          return alert("Enter a valid 10-digit phone number.");
        }
        if (password !== confirm) {
          return alert("Passwords do not match.");
        }
        if (password.length < 6) {
          return alert("Password must be at least 6 characters.");
        }
  
        // ── profile photo → base64 ──
        let profilePhoto = "";
        const picInput = document.getElementById("profilePic");
        if (picInput && picInput.files[0]) {
          profilePhoto = await toBase64(picInput.files[0]);
        }
  
        const user = {
          name, prn, phone, email, gender,
          department: dept,
          year, role,
          manifesto:    document.getElementById("manifesto")?.value    || "",
          achievements: document.getElementById("achievements")?.value || "",
          profilePhoto,
          password,
          status: "pending",
          registeredAt: new Date().toISOString()
        };
  
        // ── check duplicate ──
        const users = JSON.parse(localStorage.getItem("users") || "{}");
        if (users[prn]) {
          return alert("An account with this PRN already exists.");
        }
  
        // ── save ──
        users[prn] = user;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("loggedInUser", JSON.stringify(user));
  
        alert("Account created successfully! 🎉");
        window.location.href = "index.html";
      });
    }
  
    // =============================================
    //  SIGNIN
    // =============================================
    const signinForm = document.getElementById("signinForm");
  
    if (signinForm) {
      signinForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const prn      = document.getElementById("signin-prn").value.trim();
        const password = document.getElementById("signin-password").value.trim();
  
        // ══════════════════════════════════════════
        //  ADMIN CREDENTIALS — change before deploy!
        // ══════════════════════════════════════════
        const ADMIN_PRN      = "ADMIN00000001";
        const ADMIN_PASSWORD = "admin@chain2026";
  
        if (prn === ADMIN_PRN && password === ADMIN_PASSWORD) {
          const adminUser = {
            name:  "Admin",
            prn:   ADMIN_PRN,
            role:  "admin",
            email: "admin@chainsankalp.in"
          };
          localStorage.setItem("loggedInUser", JSON.stringify(adminUser));
          alert("Welcome, Admin! 👋");
          window.location.href = "admin.html";
          return;
        }
  
        // ── try backend first ──
        try {
          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prn, password })
          });
  
          const data = await res.json();
  
          if (res.ok) {
            localStorage.setItem("loggedInUser", JSON.stringify(data));
            alert("Welcome back! 🚀");
            redirectAfterLogin(data);
            return;
          }
  
          // backend returned error
          alert(data.message || "Invalid credentials.");
  
        } catch (err) {
          // ── backend not running: fallback to localStorage ──
          console.warn("Backend unavailable, using localStorage fallback.");
  
          const users = JSON.parse(localStorage.getItem("users") || "{}");
          const user  = users[prn];
  
          if (!user) {
            return alert("No account found with this PRN.");
          }
          if (user.password !== password) {
            return alert("Incorrect password.");
          }
  
          localStorage.setItem("loggedInUser", JSON.stringify(user));
          alert("Welcome back! 🚀");
          redirectAfterLogin(user);
        }
      });
    }
  });
  
  // =============================================
  //  HELPERS
  // =============================================
  function redirectAfterLogin(user) {
    if (user.role === "admin") {
      window.location.href = "admin.html";
    } else if (["LR","CS","GS"].includes(user.role)) {
      window.location.href = "candidate-dashboard.html";
    } else {
      window.location.href = "index.html";
    }
  }
  
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  }
  
  function forgotPassword() {
    const prn = document.getElementById("signin-prn")?.value.trim();
    if (!prn) {
      alert("Please enter your PRN first, then click Forgot Password.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (!users[prn]) {
      alert("No account found with this PRN.");
      return;
    }
    // In production: trigger OTP / email reset flow
    alert(`Password reset link sent to ${users[prn].email || "your registered email"}.`);
  }
  
  // expose for inline onclick in signin.html
  async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask not found. Please install MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const btn = document.querySelector(".wallet-btn");
      if (btn) {
        btn.textContent = `${accounts[0].slice(0,6)}...${accounts[0].slice(-4)} ✓`;
        btn.style.background = "rgba(29,158,117,0.2)";
        btn.style.color = "#1D9E75";
        btn.style.borderColor = "rgba(29,158,117,0.4)";
      }
      localStorage.setItem("walletAddress", accounts[0]);
    } catch (err) {
      alert("Wallet connection cancelled.");
    }
  }