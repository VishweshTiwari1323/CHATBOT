/* ======================================================
   AI REGISTER PAGE JAVASCRIPT
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    welcomeAnimation();

    inputEffects();

    passwordStrength();

    formValidation();

    buttonRipple();

    floatingBackground();

});

/* ======================================================
   PASSWORD SHOW / HIDE
====================================================== */

function togglePassword(inputId, iconElement) {

    const input = document.getElementById(inputId);

    const icon = iconElement.querySelector("i");

    if (input.type === "password") {

        input.type = "text";

        icon.classList.remove("fa-eye");

        icon.classList.add("fa-eye-slash");

    } else {

        input.type = "password";

        icon.classList.remove("fa-eye-slash");

        icon.classList.add("fa-eye");

    }

}

/* ======================================================
   WELCOME ANIMATION
====================================================== */

function welcomeAnimation() {

    const box = document.querySelector(".register-box");

    if (!box) return;

    box.style.opacity = "0";

    box.style.transform = "translateY(40px)";

    setTimeout(() => {

        box.style.transition = "all .8s ease";

        box.style.opacity = "1";

        box.style.transform = "translateY(0)";

    }, 150);

}

/* ======================================================
   INPUT FOCUS EFFECT
====================================================== */

function inputEffects() {

    const inputs = document.querySelectorAll("input");

    inputs.forEach(input => {

        input.addEventListener("focus", () => {

            input.parentElement.style.transform = "scale(1.02)";

        });

        input.addEventListener("blur", () => {

            input.parentElement.style.transform = "scale(1)";

        });

    });

}

/* ======================================================
   PASSWORD STRENGTH
====================================================== */

function passwordStrength() {

    const password = document.getElementById("password");

    if (!password) return;

    password.addEventListener("input", () => {

        const value = password.value;

        let strength = 0;

        if (value.length >= 8) strength++;

        if (/[A-Z]/.test(value)) strength++;

        if (/[a-z]/.test(value)) strength++;

        if (/[0-9]/.test(value)) strength++;

        if (/[^A-Za-z0-9]/.test(value)) strength++;

        if (strength <= 2) {

            password.style.border = "2px solid #ef4444";

        }

        else if (strength <= 4) {

            password.style.border = "2px solid #f59e0b";

        }

        else {

            password.style.border = "2px solid #22c55e";

        }

    });

}

/* ======================================================
   FORM VALIDATION
====================================================== */

function formValidation() {
    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        const username = document.querySelector("input[name='username']").value.trim();
        const email = document.querySelector("input[name='email']").value.trim();
        const password = document.querySelector("input[name='password1']").value;
        const confirm = document.querySelector("input[name='password2']").value;

        if (!username || !email || !password || !confirm) {
            e.preventDefault();
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirm) {
            e.preventDefault();
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            e.preventDefault();
            alert("Password must be at least 8 characters.");
            return;
        }
    });

}

/* ======================================================
   BUTTON RIPPLE
====================================================== */

function buttonRipple() {

    const button = document.querySelector(".register-btn");

    if (!button) return;

    button.addEventListener("click", function (e) {

        const circle = document.createElement("span");

        const diameter = Math.max(this.clientWidth, this.clientHeight);

        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;

        circle.style.left = `${e.clientX - this.offsetLeft - radius}px`;

        circle.style.top = `${e.clientY - this.offsetTop - radius}px`;

        circle.classList.add("ripple");

        const ripple = this.querySelector(".ripple");

        if (ripple) {

            ripple.remove();

        }

        this.appendChild(circle);

    });

}

/* ======================================================
   FLOATING BACKGROUND EFFECT
====================================================== */

function floatingBackground() {

    const circles = document.querySelectorAll(".background span");

    document.addEventListener("mousemove", (e) => {

        circles.forEach((circle, index) => {

            const speed = (index + 1) * 0.01;

            const x = (window.innerWidth / 2 - e.clientX) * speed;

            const y = (window.innerHeight / 2 - e.clientY) * speed;

            circle.style.transform = `translate(${x}px, ${y}px)`;

        });

    });

}

/* ======================================================
   CONSOLE MESSAGE
====================================================== */

console.log(

    "%c🤖 AI Register Page Loaded Successfully",

    "color:#3b82f6;font-size:18px;font-weight:bold;"

);