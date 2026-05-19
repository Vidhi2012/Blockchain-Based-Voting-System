// =====================
// ADMIN PROTECTION
// =====================
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access Denied ❌");
    window.location.href = "signin.html";
}

// =====================
// LOAD USERS
// =====================
function loadUsers() {
    const users = JSON.parse(localStorage.getItem("users")) || {};

    const userList = document.getElementById("userList");
    const candidateList = document.getElementById("candidateList");

    userList.innerHTML = "";
    candidateList.innerHTML = "";

    Object.values(users).forEach(user => {
        // USER CARD
        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            <p><b>Name:</b> ${user.name}</p>
            <p><b>PRN:</b> ${user.prn}</p>
            <p><b>Role:</b> ${user.role}</p>
        `;

        userList.appendChild(div);

        // CANDIDATES
        if (user.role === "candidate" && !user.approved) {
            const cdiv = document.createElement("div");
            cdiv.classList.add("card");

            cdiv.innerHTML = `
                <p><b>${user.name}</b></p>
                <p>${user.manifesto || "No manifesto"}</p>
                <button onclick="approveCandidate('${user.prn}')">Approve</button>
            `;

            candidateList.appendChild(cdiv);
        }
    });
}

// =====================
// APPROVE CANDIDATE
// =====================
function approveCandidate(prn) {
    const users = JSON.parse(localStorage.getItem("users"));

    users[prn].approved = true;

    localStorage.setItem("users", JSON.stringify(users));

    alert("Candidate Approved ✅");
    loadUsers();
}

// =====================
// LOGOUT
// =====================
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "signin.html";
}

// LOAD DATA
loadUsers();