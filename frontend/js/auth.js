(function () {
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");
  const messageEl = document.getElementById("auth-message");

  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = "auth-message is-visible auth-message--" + type;
  }

  function clearMessage() {
    if (!messageEl) return;
    messageEl.textContent = "";
    messageEl.className = "auth-message";
  }

  if (signinForm) {
    signinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearMessage();
      const email = signinForm.querySelector("#email").value.trim();
      const password = signinForm.querySelector("#password").value;
      if (!email || !password) {
        showMessage("Please fill in all fields.", "error");
        return;
      }
      showMessage("Demo: no API yet. Redirecting to the app…", "ok");
      setTimeout(function () {
        window.location.href = "index.html";
      }, 900);
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearMessage();
      const name = signupForm.querySelector("#name").value.trim();
      const email = signupForm.querySelector("#email").value.trim();
      const password = signupForm.querySelector("#password").value;
      const confirm = signupForm.querySelector("#confirm").value;
      if (!name || !email || !password || !confirm) {
        showMessage("Please fill in all fields.", "error");
        return;
      }
      if (password.length < 8) {
        showMessage("Password must be at least 8 characters.", "error");
        return;
      }
      if (password !== confirm) {
        showMessage("Passwords do not match.", "error");
        return;
      }
      showMessage("Demo: account created locally. Redirecting…", "ok");
      setTimeout(function () {
        window.location.href = "signin.html";
      }, 900);
    });
  }
})();
