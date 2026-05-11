document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const loginLink = document.getElementById("loginLink");
    const profileLink = document.getElementById("profileLink");
    const logoutLink = document.getElementById("logoutLink");

    // 🔒 Check login
    if (!currentUser) {
        window.location.href = "signin.html";
        return;
    }

    // ✅ Navbar control
    if (loginLink) loginLink.style.display = "none";
    if (profileLink) profileLink.style.display = "inline";
    if (logoutLink) logoutLink.style.display = "inline";

    // ✅ Status
    const statusClass =
        currentUser.status === "approved" ? "approved" : "pending";

    // ✅ Profile image
    const profileImage =
        currentUser.profilePic && currentUser.profilePic !== ""
            ? currentUser.profilePic
            : "https://via.placeholder.com/130";

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