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

        // GET VALUES (CORRECT WAY)
        const name = document.getElementById("name").value;
        const prn = document.getElementById("prn").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const gender = document.getElementById("gender").value;
        const department = document.getElementById("department").value;
        const year = document.getElementById("year").value;
        const role = document.getElementById("role").value;
        const manifesto = document.getElementById("manifesto").value;
        const achievements = document.getElementById("achievements").value;
        const password = document.getElementById("password").value;

        const file = document.getElementById("profilePic").files[0];

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

        // HANDLE IMAGE
        if (file) {
            const reader = new FileReader();

            reader.onload = function () {
                const profileBase64 = reader.result;

                saveUser(profileBase64);
            };

            reader.readAsDataURL(file);
        } else {
            saveUser("");
        }

        // SAVE FUNCTION
        function saveUser(profilePic) {
            users[prn] = {
                name,
                prn,
                phone,
                email,
                gender,
                department,
                year,
                role,
                manifesto,
                achievements,
                profilePic,
                password,
                wallet: currentAccount,
            };

            localStorage.setItem("users", JSON.stringify(users));

            alert("Signup Successful ✅");

            window.location.href = "signin.html";
        }
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

        if (!users[prn]) {
            alert("User not found!");
            return;
        }

        if (users[prn].password !== password) {
            alert("Incorrect password!");
            return;
        }

        // STORE LOGGED IN USER (IMPORTANT FOR DASHBOARD)
        localStorage.setItem("loggedInUser", JSON.stringify(users[prn]));

        alert("Login Successful 🚀");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    });
}

// =====================
// FORGOT PASSWORD
// =====================
function forgotPassword() {
    const prn = prompt("Enter your PRN:");
    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (!users[prn]) {
        alert("User not found!");
        return;
    }

    const newPass = prompt("Enter new password:");
    
    if (!newPass) {
        alert("Password cannot be empty!");
        return;
    }

    users[prn].password = newPass;

    localStorage.setItem("users", JSON.stringify(users));

    alert("Password updated successfully ✅");
}