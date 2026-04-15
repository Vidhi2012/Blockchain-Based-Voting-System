const btn = document.getElementById("connectWallet");
const display = document.getElementById("walletAddress");

btn.onclick = async () => {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      display.innerText = "Connected: " + accounts[0];
    } catch (err) {
      console.log(err);
    }
  } else {
    alert("Please install MetaMask");
  }
};