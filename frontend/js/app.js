document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser")); // ✅ FIXED

  const logo = document.getElementById("logoText");
  const loginLink = document.getElementById("loginLink");
  const profileBtn = document.getElementById("profileBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // ✅ Format Name
  const formatName = (name) => {
    return name
      ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      : "";
  };

  if (currentUser) {
    // ✅ Welcome text
    if (logo) {
      logo.textContent = `Welcome, ${formatName(currentUser.name)}!`;
    }

    // ✅ Toggle navbar
    if (loginLink) loginLink.style.display = "none";
    if (profileBtn) profileBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    // ✅ Profile button → dashboard
    if (profileBtn) {
      profileBtn.onclick = () => {
        window.location.href = "candidate-dashboard.html"; // ✅ simplified
      };
    }

    // ✅ Logout
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        localStorage.removeItem("loggedInUser"); // ✅ FIXED
        localStorage.removeItem("wallet");
        window.location.href = "signin.html";
      };
    }
  }
});

// =======================
// GLOBAL VARIABLE
// =======================
let currentAccount = "";

// ELEMENTS
const btn = document.getElementById("connectWallet");
const display = document.getElementById("walletAddress");

// =======================
// CONNECT WALLET
// =======================
async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  try {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    currentAccount = accounts[0];

    // Save wallet
    localStorage.setItem("wallet", currentAccount);

    updateUI();
  } catch (err) {
    console.log(err);
    alert("Connection failed!");
  }
}

// =======================
// UPDATE UI
// =======================
function updateUI() {
  if (!display) return;

  if (currentAccount) {
    display.innerText = "🟢 Connected: " + shortenAddress(currentAccount);

    if (btn) {
      btn.innerText = "Wallet Connected";
      btn.disabled = true;
    }
  } else {
    display.innerText = "";
  }
}

// =======================
// SHORT ADDRESS
// =======================
function shortenAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

// =======================
// AUTO CONNECT
// =======================
window.addEventListener("load", () => {
  const savedWallet = localStorage.getItem("wallet");

  if (savedWallet) {
    currentAccount = savedWallet;
    updateUI();
  }
});

// =======================
// ACCOUNT CHANGE LISTENER
// =======================
if (window.ethereum) {
  ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      currentAccount = "";
      localStorage.removeItem("wallet");
      location.reload();
    } else {
      currentAccount = accounts[0];
      localStorage.setItem("wallet", currentAccount);
      updateUI();
    }
  });
}

// =======================
// BUTTON CLICK
// =======================
if (btn) {
  btn.onclick = connectWallet;
}