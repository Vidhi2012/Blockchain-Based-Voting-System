// GLOBAL VARIABLE
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

    // Save wallet in localStorage (important)
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
// SHORT ADDRESS (UI)
// =======================
function shortenAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

// =======================
// AUTO CONNECT (on reload)
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
      // User disconnected
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

// BUTTON CLICK
if (btn) {
  btn.onclick = connectWallet;
}