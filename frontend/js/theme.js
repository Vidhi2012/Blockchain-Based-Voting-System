// =============================================
//  ChainSankalp — theme.js
//  Dark / Light theme toggle — runs on every page
// =============================================

(function () {

    const STORAGE_KEY = "cs_theme";
  
    // ── apply saved theme immediately (before paint) ──
    const saved = localStorage.getItem(STORAGE_KEY) || "dark";
    document.documentElement.setAttribute("data-theme", saved);
  
    // ── once DOM is ready, wire up the toggle button ──
    document.addEventListener("DOMContentLoaded", () => {
      const btn = document.getElementById("themeToggle");
      if (!btn) return;
  
      updateToggleIcon(btn, saved);
  
      btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "dark";
        const next    = current === "dark" ? "light" : "dark";
  
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_KEY, next);
        updateToggleIcon(btn, next);
      });
    });
  
    function updateToggleIcon(btn, theme) {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.title       = theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
    }
  
  })();