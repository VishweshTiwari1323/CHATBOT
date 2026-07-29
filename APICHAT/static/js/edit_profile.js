/*======================================================
                EDIT PROFILE JS ENGINE
======================================================*/

document.addEventListener("DOMContentLoaded", () => {
    previewImage();
    floatingHero();
    revealAnimation();
    inputGlow();
    setupRipple();
    imageTilt();
    cardGlow();
    buttonScale();
    formValidation();
    resetConfirmation();
    liveClock();
});

/* Image Preview */
function previewImage() {
    const input = document.getElementById("profileImage");
    const preview = document.getElementById("previewImage");

    if (!input || !preview) return;

    input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            preview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

/* Floating Hero Icon */
function floatingHero() {
    const hero = document.querySelector(".hero-icon");
    if (!hero) return;

    document.addEventListener("mousemove", (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 45;
        const y = (window.innerHeight / 2 - e.clientY) / 45;
        hero.style.transform = `translate(${x}px, ${y}px)`;
    });
}

/* Input Glow Focus */
function inputGlow() {
    document.querySelectorAll("input, textarea").forEach(input => {
        input.addEventListener("focus", () => {
            input.parentElement.style.transform = "scale(1.01)";
            input.parentElement.style.transition = "transform 0.2s ease";
        });
        input.addEventListener("blur", () => {
            input.parentElement.style.transform = "scale(1)";
        });
    });
}

/* Scroll Reveal */
function revealAnimation() {
    const items = document.querySelectorAll(".hero, .profile-card, .edit-form, .danger-zone, .input-box");
    
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0px)";
            }
        });
    }, {
        threshold: 0.1
    });

    items.forEach(item => {
        item.style.opacity = "0";
        item.style.transform = "translateY(30px)";
        item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(item);
    });
}

/* Ripple Button Effect */
function setupRipple() {
    document.querySelectorAll(".save-btn, .reset-btn, .back-btn, .delete-btn, .sec-btn").forEach(button => {
        button.addEventListener("click", function(e) {
            const circle = document.createElement("span");
            const rect = this.getBoundingClientRect();
            const diameter = Math.max(rect.width, rect.height);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add("ripple");

            const existingRipple = this.querySelector(".ripple");
            if (existingRipple) {
                existingRipple.remove();
            }

            this.appendChild(circle);
        });
    });
}

/* 3D Tilt Effect for Profile Image */
function imageTilt() {
    const imageBox = document.querySelector(".image-box");
    if (!imageBox) return;

    imageBox.addEventListener("mousemove", (e) => {
        const rect = imageBox.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = (y - rect.height / 2) / 8;
        const rotateY = (rect.width / 2 - x) / 8;

        imageBox.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    imageBox.addEventListener("mouseleave", () => {
        imageBox.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    });
}

/* Card Glow Effect */
function cardGlow() {
    document.querySelectorAll(".profile-card, .edit-form, .danger-zone").forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(59, 130, 246, 0.12), rgba(255, 255, 255, 0.05))`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.background = "rgba(255, 255, 255, 0.05)";
        });
    });
}

/* Button Hover Scale */
function buttonScale() {
    document.querySelectorAll(".save-btn, .reset-btn, .delete-btn, .sec-btn").forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            btn.style.transform = "translateY(-3px)";
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "translateY(0)";
        });
    });
}

/* Form Validation & Submission Spinner */
function formValidation() {
    const form = document.getElementById("editProfileForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        const username = document.querySelector("input[name='username']");
        const email = document.querySelector("input[name='email']");

        if (!username || username.value.trim() === "") {
            alert("Username cannot be empty.");
            if (username) username.focus();
            e.preventDefault();
            return;
        }

        if (!email || email.value.trim() === "") {
            alert("Email cannot be empty.");
            if (email) email.focus();
            e.preventDefault();
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value)) {
            alert("Please enter a valid email address.");
            email.focus();
            e.preventDefault();
            return;
        }

        const saveBtn = document.querySelector(".save-btn");
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            saveBtn.style.pointerEvents = "none";
            saveBtn.style.opacity = "0.8";
        }
    });
}

/* Reset Form Confirmation */
function resetConfirmation() {
    const resetBtn = document.querySelector(".reset-btn");
    if (!resetBtn) return;

    resetBtn.addEventListener("click", (e) => {
        const confirmReset = confirm("Are you sure you want to reset all field values?");
        if (!confirmReset) {
            e.preventDefault();
        }
    });
}

/* Live Clock */
function liveClock() {
    const clock = document.getElementById("liveClock");
    if (!clock) return;

    function update() {
        const now = new Date();
        clock.innerHTML = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    setInterval(update, 1000);
    update();
}

/* Keyboard Shortcuts */
document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "p") {
        window.location.href = "/profile/";
    } else if (e.altKey && e.key.toLowerCase() === "d") {
        window.location.href = "/dashboard/";
    } else if (e.altKey && e.key.toLowerCase() === "c") {
        window.location.href = "/chatbot/";
    }
});

/* Page Entrance */
function initIntroAnimation() {
    const container = document.querySelector(".edit-container");
    if (container) {
        container.classList.add("loaded");
    }
}

if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initIntroAnimation);
} else {
    initIntroAnimation();
}

console.log(
    "%c✏️ Edit Profile JS Loaded Successfully",
    "color:#3B82F6;font-size:16px;font-weight:bold;"
);