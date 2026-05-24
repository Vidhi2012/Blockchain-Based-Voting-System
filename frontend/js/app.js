document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

    const loginLink = document.getElementById("loginLink");
    const profileBtn = document.getElementById("profileBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const welcomeText = document.getElementById("welcomeText");

    if (!loginLink || !profileBtn || !logoutBtn) return;

    const logoText = document.getElementById("logoText");

    if (user) {
    
        loginLink.style.display = "none";
        profileBtn.style.display = "inline-block";
        logoutBtn.style.display = "inline-block";
    
        // 🔥 REPLACE LOGO TEXT
        logoText.innerText = `Welcome, ${user.name || user.prn}`;
    
        profileBtn.onclick = () => {
            if (["LR", "CS", "GS"].includes(user.role)) {
                window.location.href = "candidate-dashboard.html";
            } else if (user.role === "ADMIN") {
                window.location.href = "admin.html";
            }
        };
    
    } else {
        loginLink.style.display = "inline-block";
        profileBtn.style.display = "none";
        logoutBtn.style.display = "none";
    
        // restore original logo
        logoText.innerText = "⛓ ChainSankalp";
    }
    
});

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "signin.html";
}