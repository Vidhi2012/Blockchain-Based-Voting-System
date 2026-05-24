let users = JSON.parse(localStorage.getItem("users")) || {};

document.addEventListener("DOMContentLoaded", () => {

    // SIGNUP
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const user = {
                name: document.getElementById("name").value,
                prn: document.getElementById("prn").value,
                phone: document.getElementById("phone").value,
                email: document.getElementById("email").value,
                gender: document.getElementById("gender").value,
                department: document.getElementById("department").value,
                year: document.getElementById("year").value,
                role: document.getElementById("role").value,
                manifesto: document.getElementById("manifesto").value,
                achievements: document.getElementById("achievements").value,
                password: document.getElementById("password").value,
                profilePhoto: ""
            };

            if (users[user.prn]) {
                alert("User already exists");
                return;
            }

            users[user.prn] = user;

            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("loggedInUser", JSON.stringify(user));

            window.location.href = "index.html";
        });
    }

    // SIGNIN
    document.getElementById("signinForm").addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const prn = document.getElementById("signin-prn").value.trim();
        const password = document.getElementById("signin-password").value.trim();
    
        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prn, password })
            });
    
            const data = await res.json();
    
            if (res.ok) {
    
                // ✅ IMPORTANT: consistent key
                localStorage.setItem("loggedInUser", JSON.stringify(data));
    
                alert("Login successful 🚀");
                window.location.href = "index.html";
    
            } else {
                alert(data.message || "Invalid credentials");
            }
    
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    });
});