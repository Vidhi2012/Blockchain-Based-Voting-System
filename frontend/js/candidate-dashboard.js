document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const loginLink = document.getElementById("loginLink");
    const profileLink = document.getElementById("profileLink");
    const logoutLink = document.getElementById("logoutLink");

    // 🔒 Check login
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

if (!user || user.role !== "candidate") {
    alert("Access denied");
    window.location.href = "signin.html";
}

    // ✅ Navbar control
    if (loginLink) loginLink.style.display = "none";
    if (profileLink) profileLink.style.display = "inline";
    if (logoutLink) logoutLink.style.display = "inline";

    // ✅ Status
    const statusClass =
        currentUser.status === "approved" ? "approved" : "pending";
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const users = JSON.parse(localStorage.getItem("users"));
        
        const statusDiv = document.getElementById("status");
        
        if (users[user.prn].approved) {
            statusDiv.innerHTML = "Status: Approved ✅";
        } else {
            statusDiv.innerHTML = "Status: Pending ⏳";
        }
    // ✅ Profile image
    document.addEventListener("DOMContentLoaded", () => {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
    
        if (user && user.profilePhoto) {
            document.getElementById("profileImg").src = user.profilePhoto;
        }
    });
    // ✅ Fill data (NO innerHTML overwrite)
    document.getElementById("profile-img").src = profileImage;

    document.getElementById("candidateName").innerText =
        currentUser.name || "No Name";

    const statusEl = document.getElementById("status");
    statusEl.innerText =
        (currentUser.status || "pending").toUpperCase();
    statusEl.className = "status " + statusClass;

    document.getElementById("position").innerText =
        currentUser.role || "N/A";

    document.getElementById("department").innerText =
        currentUser.department || "N/A";

    document.getElementById("year").innerText =
        currentUser.year || "N/A";

    // ✅ FIXED: Missing fields
    document.getElementById("achievements").innerText =
        currentUser.achievements || "No achievements added";

    document.getElementById("manifesto").innerText =
        currentUser.manifesto || "N/A";

    // ✅ Logout working
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("loggedInUser");
            window.location.href = "signin.html";
        });
    }
});