/*======================================================
                AI PROFILE JAVASCRIPT
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    animateCounters();

    greeting();

    profileTilt();

    floatingCards();

    revealAnimation();

});

/*======================================================
                GREETING
======================================================*/

function greeting() {

    const heroTitle = document.querySelector(".hero h1");

    if (!heroTitle) return;

    const hour = new Date().getHours();

    let greet = "";

    if (hour < 12) {

        greet = "🌅 Good Morning";

    }

    else if (hour < 17) {

        greet = "☀️ Good Afternoon";

    }

    else {

        greet = "🌙 Good Evening";

    }

    const username = heroTitle.innerText.split(",")[1]?.trim() || "";

    heroTitle.innerHTML = `${greet}, ${username}`;

}

/*======================================================
            COUNTER ANIMATION
======================================================*/

function animateValue(id, end, duration){

    const obj = document.getElementById(id);

    if(!obj) return;

    let start = 0;

    const increment = end / (duration / 20);

    const timer = setInterval(()=>{

        start += increment;

        if(start >= end){

            start = end;

            clearInterval(timer);

        }

        obj.innerText = Math.floor(start);

    },20);

}

function animateCounters(){

    animateValue(

        "chatCount",

        Number(document.getElementById("chatCount")?.innerText || 0),

        1200

    );

    animateValue(

        "responseCount",

        Number(document.getElementById("responseCount")?.innerText || 0),

        1400

    );

    animateValue(

        "savedCount",

        Number(document.getElementById("savedCount")?.innerText || 0),

        1600

    );

    animateValue(

        "todayCount",

        Number(document.getElementById("todayCount")?.innerText || 0),

        1000

    );

}

/*======================================================
                PROFILE IMAGE TILT
======================================================*/

function profileTilt(){

    const image = document.querySelector(".profile-image");

    if(!image) return;

    image.addEventListener("mousemove",(e)=>{

        const rect = image.getBoundingClientRect();

        const x = e.clientX - rect.left;

        const y = e.clientY - rect.top;

        const rotateX = (y - rect.height/2)/10;

        const rotateY = (rect.width/2 - x)/10;

        image.style.transform =

        `rotateX(${rotateX}deg)

         rotateY(${rotateY}deg)

         scale(1.05)`;

    });

    image.addEventListener("mouseleave",()=>{

        image.style.transform =

        "rotateX(0deg) rotateY(0deg) scale(1)";

    });

}
/*======================================================
                FLOATING CARDS
======================================================*/

function floatingCards(){

    const cards = document.querySelectorAll(

        ".stat-card,.achievement-card,.action-card,.timeline-content"

    );

    cards.forEach((card,index)=>{

        card.style.animation=

        `floatCard ${4+index*.2}s ease-in-out infinite`;

    });

}

/*======================================================
                SCROLL REVEAL
======================================================*/

function revealAnimation(){

    const items=document.querySelectorAll(

        ".hero,.stat-card,.achievement-card,.activity,.timeline-item,.action-card"

    );

    const observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.style.opacity="1";

                entry.target.style.transform="translateY(0px)";

            }

        });

    },{

        threshold:.15

    });

    items.forEach(item=>{

        item.style.opacity="0";

        item.style.transform="translateY(40px)";

        item.style.transition=".7s ease";

        observer.observe(item);

    });

}

/*======================================================
                RIPPLE EFFECT
======================================================*/

document.querySelectorAll(

    ".btn,.action-card"

).forEach(button=>{

    button.addEventListener("click",function(e){

        const circle=document.createElement("span");

        const diameter=Math.max(

            this.clientWidth,

            this.clientHeight

        );

        const radius=diameter/2;

        circle.style.width=

        circle.style.height=

        `${diameter}px`;

        circle.style.left=

        `${e.clientX-this.offsetLeft-radius}px`;

        circle.style.top=

        `${e.clientY-this.offsetTop-radius}px`;

        circle.classList.add("ripple");

        const ripple=this.getElementsByClassName(

            "ripple"

        )[0];

        if(ripple){

            ripple.remove();

        }

        this.appendChild(circle);

    });

});

/*======================================================
            CARD MOUSE GLOW
======================================================*/

document.querySelectorAll(

    ".stat-card,.achievement-card,.action-card"

).forEach(card=>{

    card.addEventListener("mousemove",e=>{

        const rect=card.getBoundingClientRect();

        const x=e.clientX-rect.left;

        const y=e.clientY-rect.top;

        card.style.background=

        `radial-gradient(circle at ${x}px ${y}px,

        rgba(96,165,250,.20),

        rgba(255,255,255,.05))`;

    });

    card.addEventListener("mouseleave",()=>{

        card.style.background="rgba(255,255,255,.05)";

    });

});

/*======================================================
                HERO PARALLAX
======================================================*/

const heroIcon=document.querySelector(".hero-icon");

if(heroIcon){

    document.addEventListener("mousemove",(e)=>{

        const x=(window.innerWidth/2-e.clientX)/45;

        const y=(window.innerHeight/2-e.clientY)/45;

        heroIcon.style.transform=

        `translate(${x}px,${y}px)`;

    });

}
/*======================================================
                LIVE CLOCK
======================================================*/

function updateClock(){

    const clock=document.getElementById("liveClock");

    if(!clock) return;

    const now=new Date();

    clock.innerHTML=now.toLocaleTimeString([],{

        hour:'2-digit',

        minute:'2-digit',

        second:'2-digit'

    });

}

setInterval(updateClock,1000);

updateClock();

/*======================================================
                AI TIPS
======================================================*/

const aiTips=[

"💡 Press Enter to send messages instantly.",

"🚀 Save important chats for quick access.",

"🤖 Ask detailed questions for better AI responses.",

"⚡ Organize chats using folders and bookmarks.",

"🎯 Explore AI features from your dashboard."

];

let tipIndex=0;

function rotateTips(){

    const tip=document.getElementById("aiTip");

    if(!tip) return;

    tip.style.opacity="0";

    setTimeout(()=>{

        tip.innerHTML=aiTips[tipIndex];

        tip.style.opacity="1";

        tipIndex++;

        if(tipIndex>=aiTips.length){

            tipIndex=0;

        }

    },300);

}

setInterval(rotateTips,5000);

rotateTips();

/*======================================================
            ACHIEVEMENT ANIMATION
======================================================*/

document.querySelectorAll(

".achievement-card"

).forEach((card,index)=>{

    setTimeout(()=>{

        card.style.transform="translateY(0px)";

        card.style.opacity="1";

    },index*180);

});

/*======================================================
            PROFILE IMAGE GLOW
======================================================*/

const avatar=document.querySelector(".profile-image img");

if(avatar){

    setInterval(()=>{

        avatar.animate([

            {

                filter:"brightness(1)",

                transform:"scale(1)"

            },

            {

                filter:"brightness(1.15)",

                transform:"scale(1.03)"

            },

            {

                filter:"brightness(1)",

                transform:"scale(1)"

            }

        ],{

            duration:2500,

            easing:"ease-in-out"

        });

    },2600);

}

/*======================================================
            RANDOM AI STATUS
======================================================*/

const statusList=[

"🟢 AI Online",

"⚡ Ready to Assist",

"🤖 Processing Ready",

"💙 Connected Securely",

"🚀 AI Engine Active"

];

function randomStatus(){

    const role=document.querySelector(".role");

    if(!role) return;

    const random=Math.floor(

        Math.random()*statusList.length

    );

    role.innerHTML=

    `<i class="fa-solid fa-robot"></i>

     ${statusList[random]}`;

}

setInterval(randomStatus,7000);

/*======================================================
            SHORTCUTS
======================================================*/

document.addEventListener("keydown",(e)=>{

    if(e.altKey && e.key==="c"){

        window.location.href="/chatbot/";

    }

    if(e.altKey && e.key==="d"){

        window.location.href="/dashboard/";

    }

    if(e.altKey && e.key==="h"){

        window.location.href="/history/";

    }

});

/*======================================================
            PAGE LOADER
======================================================*/

window.addEventListener("load",()=>{

    document.body.style.opacity="0";

    setTimeout(()=>{

        document.body.style.transition="opacity .8s";

        document.body.style.opacity="1";

    },100);

});

/*======================================================
            CONSOLE MESSAGE
======================================================*/

console.log(

"%c👤 AI Profile Loaded Successfully",

"color:#3B82F6;font-size:18px;font-weight:bold;"

);