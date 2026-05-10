// Store current wallet
let currentAccount = "";

// =====================
// CONNECT WALLET
// =====================
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            currentAccount = accounts[0];
            alert("Wallet Connected: " + currentAccount);
        } catch (err) {
            alert("Connection Failed!");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

// =====================
// SIGNUP LOGIC
// =====================
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.querySelector("input[type='text']").value;
        const prn = document.getElementById("prn").value;
        const phone = document.getElementById("phone").value;
        const email = document.querySelector("input[type='email']").value;
        const gender = document.querySelector("select").value;
        const department = document.querySelector("select")[1].value;
        const year = document.querySelectorAll("select")[1].value;
        const password = document.getElementById("password").value;

        // VALIDATIONS
        if (prn.length !== 14 || isNaN(prn)) {
            alert("PRN must be 14 digits");
            return;
        }

        if (phone.length !== 10 || isNaN(phone)) {
            alert("Phone must be 10 digits");
            return;
        }

        
        let users = JSON.parse(localStorage.getItem("users")) || {};

        if (users[prn]) {
            alert("User already exists!");
            return;
        }

        // STORE USER
        users[prn] = {
            name,
            phone,
            email,
            gender,
            year,
            password,
            wallet: currentAccount,
        };

        localStorage.setItem("users", JSON.stringify(users));

        alert("Signup Successful ✅");

        // redirect to signin
        window.location.href = "signin.html";
    });
}

// =====================
// SIGNIN LOGIC
// =====================
const signinForm = document.getElementById("signinForm");

if (signinForm) {
    signinForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const prn = document.getElementById("signin-prn").value;
        const password = document.getElementById("signin-password").value;

        let users = JSON.parse(localStorage.getItem("users")) || {};

        // CHECK USER
        if (!users[prn]) {
            alert("User not found!");
            return;
        }

        // PASSWORD CHECK
        if (users[prn].password !== password) {
            alert("Incorrect password!");
            return;
        }

       

        alert("Login Successful 🚀");

        // Redirect to voting page
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    });
}