/* ======================================================
   AI DASHBOARD JAVASCRIPT
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    greeting();

    robotParallax();

    revealOnScroll();

    notificationAnimation();

    rippleButtons();

    cardHoverEffect();

    sidebarActiveState();

});

/* ======================================================
   DYNAMIC GREETING
====================================================== */

function greeting() {

    const title = document.getElementById("greeting");

    if (!title) return;

    const hour = new Date().getHours();

    let greetingText = "Welcome";

    if (hour < 12) {

        greetingText = "🌅 Good Morning";

    } else if (hour < 17) {

        greetingText = "☀️ Good Afternoon";

    } else {

        greetingText = "🌙 Good Evening";

    }

    const username = title.dataset.username || "";

    if (username !== "") {

        title.innerHTML = `${greetingText}, ${username}`;

    } else {

        title.innerHTML = greetingText;

    }

}

/* ======================================================
   ROBOT PARALLAX
====================================================== */

function robotParallax() {

    const robot = document.querySelector(".robot-circle");

    if (!robot) return;

    document.addEventListener("mousemove", (e) => {

        const x = (window.innerWidth / 2 - e.clientX) / 40;

        const y = (window.innerHeight / 2 - e.clientY) / 40;

        robot.style.transform = `translate(${x}px, ${y}px)`;

    });

}

/* ======================================================
   SCROLL REVEAL
====================================================== */

function revealOnScroll() {

    const elements = document.querySelectorAll(

        ".card, .action-card, .recent-card, .suggestion-card, .llm-module-info, .tip-card, .hero, .quick-actions, .recent, .suggestions"

    );

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";

                entry.target.style.transform = "translateY(0)";

                observer.unobserve(entry.target);

            }

        });

    }, {

        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"

    });

    elements.forEach((element) => {

        element.style.opacity = "0";

        element.style.transform = "translateY(40px)";

        element.style.transition = "all 0.7s ease";

        observer.observe(element);

    });

}

/* ======================================================
   NOTIFICATION BELL ANIMATION
====================================================== */

function notificationAnimation() {

    const bell = document.querySelector(".notification");

    if (!bell) return;

    // Add ring animation style dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ringBell {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(15deg); }
            20% { transform: rotate(-15deg); }
            30% { transform: rotate(10deg); }
            40% { transform: rotate(-10deg); }
            50% { transform: rotate(5deg); }
            60% { transform: rotate(-5deg); }
            70% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
        }
        .notification.ring {
            animation: ringBell 0.8s ease-in-out;
            background: #4f46e5 !important;
            box-shadow: 0 0 25px rgba(79, 70, 229, 0.7) !important;
        }
    `;
    document.head.appendChild(style);

    setInterval(() => {

        bell.classList.add("ring");

        setTimeout(() => {

            bell.classList.remove("ring");

        }, 800);

    }, 6000);
}

/* ======================================================
   RIPPLE EFFECT
====================================================== */

function rippleButtons() {

    const buttons = document.querySelectorAll(

        ".primary-btn, .secondary-btn, .action-card, .card, .notification, .profile-card, .recent-card, .suggestion-card, .menu li a"

    );

    buttons.forEach((button) => {

        button.addEventListener("click", function (e) {

            const circle = document.createElement("span");

            const diameter = Math.max(

                this.clientWidth,

                this.clientHeight

            );

            const radius = diameter / 2;

            circle.style.width = `${diameter}px`;

            circle.style.height = `${diameter}px`;

            circle.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;

            circle.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;

            circle.classList.add("ripple");

            const oldRipple = this.querySelector(".ripple");

            if (oldRipple) {

                oldRipple.remove();

            }

            this.appendChild(circle);

        });

    });

}

/* ======================================================
   CARD HOVER GLOW EFFECT
====================================================== */

function cardHoverEffect() {

    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {

        card.addEventListener("mousemove", (e) => {

            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;

            const y = e.clientY - rect.top;

            card.style.background =

                `radial-gradient(circle at ${x}px ${y}px, rgba(99,102,241,.25), rgba(255,255,255,.06))`;

        });

        card.addEventListener("mouseleave", () => {

            card.style.background = "rgba(255,255,255,.06)";

        });

    });

}

/* ======================================================
   SIDEBAR ACTIVE STATE
====================================================== */

function sidebarActiveState() {

    const currentPath = window.location.pathname;

    const menuLinks = document.querySelectorAll(".menu li a");

    menuLinks.forEach((link) => {

        const href = link.getAttribute("href");

        if (href && currentPath.includes(href) && href !== "/" && href !== "") {

            link.parentElement.classList.add("active");

        } else if (href === currentPath) {

            link.parentElement.classList.add("active");

        }

    });

}

/* ======================================================
   PAGE LOADER
====================================================== */

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

    // Add fade-in animation for the whole dashboard
    const dashboard = document.querySelector(".dashboard");
    if (dashboard) {
        dashboard.style.opacity = "0";
        dashboard.style.transition = "opacity 0.6s ease";
        setTimeout(() => {
            dashboard.style.opacity = "1";
        }, 100);
    }

});

/* ======================================================
   CONSOLE MESSAGE
====================================================== */

console.log(

    "%c🤖 AI Dashboard Loaded Successfully",

    "color:#4F46E5;font-size:18px;font-weight:bold;"

);

console.log(

    "%c✨ All systems ready",

    "color:#60a5fa;font-size:14px;"

);
document.addEventListener("DOMContentLoaded", function () {
    const greetingText = document.getElementById("greeting-text");
    const greetingEmoji = document.getElementById("greeting-emoji");
    const greetingHeading = document.getElementById("greeting");

    if (greetingHeading && greetingText) {
        const username = greetingHeading.getAttribute("data-username") || "";
        const currentHour = new Date().getHours();

        let timeGreeting = "Welcome Back";
        let emoji = "☀️";

        if (currentHour >= 5 && currentHour < 12) {
            timeGreeting = "Good Morning";
            emoji = "🌅";
        } else if (currentHour >= 12 && currentHour < 18) {
            timeGreeting = "Good Afternoon";
            emoji = "☀️";
        } else {
            timeGreeting = "Good Evening";
            emoji = "🌙";
        }

        if (greetingEmoji) {
            greetingEmoji.textContent = emoji;
        }
        greetingText.textContent = `${timeGreeting}, ${username}`;
    }
});