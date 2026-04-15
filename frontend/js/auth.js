let currentAccount = "";

// CONNECT WALLET
const connectBtn = document.getElementById("connectWallet");
const walletDisplay = document.getElementById("walletAddress");

if (connectBtn) {
  connectBtn.onclick = async () => {
    if (window.ethereum) {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      currentAccount = accounts[0];
      walletDisplay.innerText = "Connected: " + currentAccount;
    } else {
      alert("Install MetaMask");
    }
  };
}

// SIGNUP LOGIC
const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
  registerBtn.onclick = () => {
    const prn = document.getElementById("prn").value;
    const status = document.getElementById("status");

    if (!prn || !currentAccount) {
      status.innerText = "Fill PRN and connect wallet";
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[prn]) {
      status.innerText = "User already exists!";
      return;
    }

    users[prn] = currentAccount;

    localStorage.setItem("users", JSON.stringify(users));

    status.innerText = "Registration successful ✅";
  };
}

// LOGIN LOGIC
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.onclick = () => {
    const prn = document.getElementById("loginPrn").value;
    const status = document.getElementById("status");

    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (!users[prn]) {
      status.innerText = "User not found!";
      return;
    }

    if (users[prn] !== currentAccount) {
      status.innerText = "Wallet does not match!";
      return;
    }

    status.innerText = "Login successful 🚀";

    // Redirect (future)
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  };
}