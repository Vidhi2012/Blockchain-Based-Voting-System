document.addEventListener("DOMContentLoaded", () => {

    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const loginLink = document.getElementById("loginLink");
    const profileLink = document.getElementById("profileLink");
    const logoutLink = document.getElementById("logoutLink");

    // 🔒 Check login
    //

    // ✅ Navbar control
    if (loginLink) loginLink.style.display = "none";
    if (profileLink) profileLink.style.display = "inline";
    if (logoutLink) logoutLink.style.display = "inline";

    // ✅ Status
    const statusDiv = document.getElementById("status");

    if (currentUser.status === "approved") {
        statusDiv.innerText = "Status: Approved ✅";
        statusDiv.className = "status approved";
    } else {
        statusDiv.innerText = "Status: Pending ⏳";
        statusDiv.className = "status pending";
    }

    // ✅ Profile Image (FIXED)
    const profileImg = document.getElementById("profileImg");

    if (currentUser.profilePhoto) {
        profileImg.src = currentUser.profilePhoto;
    } else {
        profileImg.src = "default.png"; // optional fallback
    }

    // ✅ Fill data
    document.getElementById("candidateName").innerText =
        currentUser.name || "No Name";

    document.getElementById("position").innerText =
        currentUser.role || "N/A";

    document.getElementById("department").innerText =
        currentUser.department || "N/A";

    document.getElementById("year").innerText =
        currentUser.year || "N/A";

    document.getElementById("achievements").innerText =
        currentUser.achievements || "No achievements added";

    document.getElementById("manifesto").innerText =
        currentUser.manifesto || "N/A";

    // ✅ Logout
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("loggedInUser");
            window.location.href = "signin.html";
        });
    }
});