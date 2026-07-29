// ==========================================
// AI CHATBOT PAGE
// chatbot.js
// ==========================================

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Read the CSRF token Django puts in the hidden form input
function getCsrfToken() {
    const tokenInput = document.querySelector(
        "input[name=csrfmiddlewaretoken]"
    );
    return tokenInput ? tokenInput.value : "";
}

// Remove the "No messages yet" placeholder the first time a message is sent
function clearEmptyState() {
    const emptyState = chatWindow.querySelector(".empty-state");
    if (emptyState) {
        emptyState.remove();
    }
}

// Build and append a message bubble to the chat window
function appendMessage(text, sender, chatId = null) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    // Attach save button if it's a bot message and has a chat ID
    if (sender === "bot" && chatId) {
        const saveContainer = document.createElement("div");
        saveContainer.style.marginTop = "8px";
        saveContainer.style.textAlign = "right";

        saveContainer.innerHTML = `
            <form method="POST" action="/toggle-save-chat/${chatId}/" style="display:inline;">
                <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrfToken()}">
                <button type="submit" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size: 13px;">
                    <i class="fa-solid fa-bookmark"></i> Save Chat
                </button>
            </form>
        `;
        bubble.appendChild(saveContainer);
    }

    messageDiv.appendChild(bubble);
    chatWindow.appendChild(messageDiv);

    chatWindow.scrollTop = chatWindow.scrollHeight;

    return messageDiv;
}

// Show a "typing..." placeholder while waiting for the server response
function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot-message";
    typingDiv.id = "typingIndicator";

    const bubble = document.createElement("div");
    bubble.className = "bubble typing";
    bubble.innerHTML = `<i class="fa-solid fa-ellipsis fa-fade"></i>`;

    typingDiv.appendChild(bubble);
    chatWindow.appendChild(typingDiv);

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById("typingIndicator");
    if (typingDiv) {
        typingDiv.remove();
    }
}

if (chatForm) {
    chatForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const message = messageInput.value.trim();

        if (message === "") {
            return;
        }

        clearEmptyState();

        appendMessage(message, "user");

        messageInput.value = "";
        messageInput.disabled = true;
        sendBtn.disabled = true;

        showTypingIndicator();

        try {
            const response = await fetch("/chatbot/send/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCsrfToken(),
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: new URLSearchParams({ message: message })
            });

            const data = await response.json();

            removeTypingIndicator();

            if (!response.ok) {
                appendMessage(
                    data.error || "Something went wrong. Please try again.",
                    "bot"
                );
            } else {
                appendMessage(data.response, "bot", data.chat_id);
            }
        } catch (error) {
            removeTypingIndicator();

            appendMessage(
                "Network error. Please check your connection and try again.",
                "bot"
            );

            console.error("Chat send error:", error);
        } finally {
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();
        }
    });
}

// Auto-scroll to the latest message on page load
window.addEventListener("load", () => {
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});

// Toggle Recent Chats Panel
const recentToggleBtn = document.getElementById("recentToggleBtn");
const recentChatsPanel = document.getElementById("recentChatsPanel");

if (recentToggleBtn && recentChatsPanel) {
    recentToggleBtn.addEventListener("click", () => {
        recentChatsPanel.classList.toggle("open");
        recentToggleBtn.classList.toggle("open");
    });
}
// Example in your chat form event listener:
fetch("/chat-api/", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRFToken": csrftoken
    },
    body: new URLSearchParams({ "message": userMessage })
})
.then(response => response.json())
.then(data => {
    if (data.response) {
        // Convert Markdown response to formatted HTML
        const formattedHtml = marked.parse(data.response);
        
        // Append formatted HTML inside the bot bubble
        botBubble.innerHTML = formattedHtml;
        
        // Scroll to bottom
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});