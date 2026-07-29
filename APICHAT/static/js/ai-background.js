/*==========================================
        AI BACKGROUND ENGINE
==========================================*/

const canvas = document.getElementById("aiCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/*=========================================================
            MOUSE
=========================================================*/

const mouse = {
    x: null,
    y: null,
    radius: 120
};

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

/*=========================================================
            PARTICLE CLASS
=========================================================*/

class Particle {

    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        this.radius = Math.random() * 2.2 + 1;

        this.speedX = (Math.random() - 0.5) * 0.35;
        this.speedY = (Math.random() - 0.5) * 0.35;

        this.opacity = Math.random() * 0.5 + 0.2;

        this.glow = Math.random() * 6 + 3;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Screen wrap
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;

        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;

        // Mouse interaction
        if (mouse.x !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                this.x += dx * 0.01;
                this.y += dy * 0.01;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.shadowBlur = this.glow;
        ctx.shadowColor = "#60A5FA";
        ctx.fillStyle = `rgba(96,165,250,${this.opacity})`;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

/*=========================================================
                ENERGY PULSES
=========================================================*/

const pulses = [];

class Pulse {

    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.progress = 0;
        this.speed = 0.015 + Math.random() * 0.02;
    }

    update() {
        this.progress += this.speed;
    }

    draw() {
        if (this.progress >= 1) return;

        const x = this.start.x + (this.end.x - this.start.x) * this.progress;
        const y = this.start.y + (this.end.y - this.start.y) * this.progress;

        ctx.beginPath();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#38BDF8";
        ctx.fillStyle = "#7DD3FC";
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

/*=========================================================
            CREATE PARTICLES
=========================================================*/

const particles = [];
const PARTICLE_COUNT = 220;

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

/*=========================================================
            NEURAL CONNECTIONS
=========================================================*/

function drawConnections() {
    const maxDistance = 130;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {

            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                const opacity = 1 - distance / maxDistance;

                ctx.beginPath();
                ctx.strokeStyle = `rgba(96,165,250,${opacity * 0.28})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();

                // Occasionally spawn an energy pulse along this connection
                if (Math.random() < 0.0008) {
                    pulses.push(new Pulse(particles[i], particles[j]));
                }
            }
        }
    }
}

/*=========================================================
                    ANIMATION LOOP
=========================================================*/

let time = 0;

function animate() {
    requestAnimationFrame(animate);

    time += 0.004;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

    gradient.addColorStop(0, `hsl(${220 + Math.sin(time) * 8},55%,8%)`);
    gradient.addColorStop(.5, `hsl(${235 + Math.cos(time) * 10},55%,10%)`);
    gradient.addColorStop(1, `hsl(${205 + Math.sin(time) * 12},60%,7%)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update particles
    particles.forEach(p => p.update());

    // Draw connections (and spawn pulses)
    drawConnections();

    // Draw particles on top of connections
    particles.forEach(p => p.draw());

    // Update and draw pulses, removing finished ones
    for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].update();
        pulses[i].draw();

        if (pulses[i].progress >= 1) {
            pulses.splice(i, 1);
        }
    }
}

animate();