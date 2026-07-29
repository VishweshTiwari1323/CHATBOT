// ==========================================
// AI CHATBOT LOGIN PAGE - JS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const loginForm = document.querySelector("form");
  const loginButton = document.querySelector(".login-btn");
  const buttons = document.querySelectorAll("button");

  // Toggle Password Visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      this.classList.toggle("fa-eye", !isPassword);
      this.classList.toggle("fa-eye-slash", isPassword);
    });
  }

  // Form Submission Indicator
  if (loginForm && loginButton) {
    loginForm.addEventListener("submit", function () {
      loginButton.disabled = true;
      loginButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Signing In...</span>';
    });
  }

  // Button Ripple Effect
  buttons.forEach((button) => {
    button.addEventListener("click", function (event) {
      const circle = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - rect.left - radius}px`;
      circle.style.top = `${event.clientY - rect.top - radius}px`;
      circle.classList.add("ripple");

      const existingRipple = button.querySelector(".ripple");
      if (existingRipple) {
        existingRipple.remove();
      }

      button.appendChild(circle);

      circle.addEventListener("animationend", () => {
        circle.remove();
      });
    });
  });
});