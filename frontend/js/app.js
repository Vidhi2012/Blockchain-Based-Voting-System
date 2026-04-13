(function () {
  const connectBtn = document.getElementById("connect-btn");
  const walletStatus = document.getElementById("wallet-status");
  const contractInput = document.getElementById("contract-address");
  const voteStatus = document.getElementById("vote-status");

  function hasEthereum() {
    return typeof window.ethereum !== "undefined";
  }

  async function connectWallet() {
    if (!hasEthereum()) {
      walletStatus.textContent = "Install MetaMask to use this app.";
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      walletStatus.textContent =
        "Connected: " + accounts[0].slice(0, 6) + "…" + accounts[0].slice(-4) + " (chain " + network.chainId + ")";
    } catch (err) {
      walletStatus.textContent = err.shortMessage || err.message || "Connection failed";
    }
  }

  connectBtn.addEventListener("click", connectWallet);

  contractInput.addEventListener("change", function () {
    const addr = contractInput.value.trim();
    if (addr && ethers.isAddress(addr)) {
      voteStatus.textContent = "Valid address. Wire ABI and call contract methods from here after deployment.";
    } else if (addr) {
      voteStatus.textContent = "Invalid Ethereum address.";
    } else {
      voteStatus.textContent = "";
    }
  });
})();
