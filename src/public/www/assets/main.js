'use strict';
import { getData, postData } from "/assets/apiClient.js";
export const header = (pagename) => {
    // DOM Elements
    const toggleThemeButton = document.getElementById("toggle-theme");
    const transactionLogButton = document.getElementById("transaction-log");
    let currentTheme = localStorage.getItem("theme") || "light";

    transactionLogButton.addEventListener("click", () => {
        window.location.href = pagename == 'transactions' ? '/' : '/transactions';
    });
    // Apply theme
    if (currentTheme === "dark") {
        document.body.classList.add("dark-mode");
        toggleThemeButton.innerHTML =
            '<i class="fas fa-sun"></i>';
        // '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }
    toggleThemeButton.addEventListener("click", toggleTheme);
    console.log('pagename', pagename);

    if (pagename == 'index') {
        main()
    } else if (pagename == 'transactions') {
        transactions()
    } else if (pagename == 'row-chat') {
        chatRow()
    }

    function toggleTheme() {
        if (currentTheme === "light") {
            document.body.classList.add("dark-mode");
            currentTheme = "dark";
            toggleThemeButton.innerHTML =
                '<i class="fas fa-sun"></i>';
            // '<i class="fas fa-sun"></i> <span>Light Mode</span>';
        } else {
            document.body.classList.remove("dark-mode");
            currentTheme = "light";
            toggleThemeButton.innerHTML =
                '<i class="fas fa-moon"></i>';
            // '<i class="fas fa-moon"></i> <span>Dark Mode</span>';
        }

        localStorage.setItem("theme", currentTheme);
    }
}
export const main = () => {
    // DOM Elements
    const messagesContainer = document.getElementById("messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const newChatButton = document.getElementById("new-chat-prompt");
    const clearHistoryButton = document.getElementById("clear-history");
    const chatHistoryContainer = document.getElementById("chat-history");
    const currentChatTitle = document.getElementById("current-chat-title");
    const exportChatButton = document.getElementById("export-chat");
    // const regenerateResponseButton = document.getElementById(
    //     "regenerate-response"
    // );
    const stopResponseButton = document.getElementById("stop-response");
    const suggestionChips = document.querySelectorAll(".suggestion-chip");
    const fileUploadButton = document.getElementById("file-upload-button");
    const fileUploadInput = document.getElementById("file-upload");

    // State variables
    let isTyping = false;
    let typingSpeed = 2; // reduced for faster letter-by-letter output
    let pendingFile = null; // Store selected file until send
    let stopGeneration = false; // Flag to stop the typing effect
    let letterTimeout = null; // separate timeout for letter typing

    // Initialize application
    init();
    // Function to initialize the application
    function init() {
        // Set up textarea auto-resize
        userInput.addEventListener("input", autoResizeTextarea);

        // Set up event listeners
        sendButton.addEventListener("click", handleSendMessage);
        userInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
        // Set up event listeners
        newChatButton.addEventListener("click", openNewChatPrompt);
        suggestionChips.forEach((chip) => {
            chip.addEventListener("click", () => {
                userInput.value = (chip.textContent ?? '').trim() + ' ';
                userInput.focus();
                // handleSendMessage();
            });
        });
        // getChatTopics();
        getChat();
    }
    async function openNewChatPrompt(e) {
        e.stopPropagation();
        const title = prompt("Enter new name for this chat:", '');
        if (title) {
            const topics = await postData("/topics/", { title });
            // alert(title);
            getChatTopics();
        }
    }

    // Function to auto-resize textarea
    function autoResizeTextarea() {
        userInput.style.height = "auto";
        userInput.style.height = userInput.scrollHeight + "px";
    }
    // Function to handle sending a message
    async function handleSendMessage() {
        if (isTyping) {
            alert("Please wait until the current response is completed.");
            return;
        }
        const message = userInput.value.trim();
        // Only proceed if there is text or a pending file
        if (!message && !pendingFile) return;
        addMessageToUI("user", message);
        // Clear input and reset height
        userInput.value = "";
        userInput.style.height = "auto";

        console.log('handleSendMessage', message);
        try {
            showTypingIndicator();

            const res = await postData('/chat/', { message });


            addMessageToUIWithTypingEffect("ai", res.data);

            console.log('res', res);

        } catch (error) {
            removeTypingIndicator();
            addMessageToUIWithTypingEffect(
                "ai",
                `Sorry, I encountered an error: ${JSON.stringify(error)}`
            );
        }

    }

    function loadChat(messages) {
        const messagesContainer = document.getElementById("messages");
        messages.forEach((message) => {
            if (message.role === "user") {
                addMessageToUI("user", message.content);

            } else if (message.role === "assistant") {
                addMessageToUI("ai", message.content);
            }
        });
    }
    // Function to add user message to UI immediately
    function addMessageToUI(sender, content) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${sender}`;

        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        messageContent.textContent = content;

        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "typing-indicator";
        typingDiv.id = "typing-indicator";

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement("div");
            dot.className = "typing-dot";
            typingDiv.appendChild(dot);
        }

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Function to add message to UI with typing effect (used for non-streaming messages)
    function addMessageToUIWithTypingEffect(sender, content) {
        removeTypingIndicator();

        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${sender}`;

        const messageContent = document.createElement("div");
        messageContent.className = "message-content";

        if (sender === "user") {
            messageContent.textContent = content;
            messageDiv.appendChild(messageContent);
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return;
        }

        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);

        const processedContent = processMarkdownContent(content);

        // When AI response starts, reset the stop flag and show the stop button
        if (sender === "ai") {
            stopGeneration = false;
            stopResponseButton.style.display = "inline-block";
        }

        startTypingEffect(messageContent, processedContent, 0);
    }


    // Function to process markdown and identify code blocks
    function processMarkdownContent(content) {
        const segments = [];
        let currentPos = 0;
        const codeBlockRegex = /```([\w]*)\n([\s\S]*?)\n```/g;

        let match;
        while ((match = codeBlockRegex.exec(content)) !== null) {
            if (match.index > currentPos) {
                segments.push({
                    type: "text",
                    content: content.substring(currentPos, match.index)
                });
            }

            segments.push({
                type: "code",
                language: match[1] || "plaintext",
                content: match[2]
            });

            currentPos = match.index + match[0].length;
        }

        if (currentPos < content.length) {
            segments.push({
                type: "text",
                content: content.substring(currentPos)
            });
        }

        return segments;
    }

    // Function to start typing effect (used by non-streaming messages)
    function startTypingEffect(messageContent, segments, segmentIndex) {
        if (segmentIndex >= segments.length) {
            isTyping = false;
            stopResponseButton.style.display = "none";
            return;
        }

        const segment = segments[segmentIndex];

        if (segment.type === "code") {
            const preElement = document.createElement("pre");
            const codeElement = document.createElement("code");

            if (segment.language) {
                codeElement.className = `language-${segment.language}`;
            }
            codeElement.classList.add("hljs");

            const copyButtonContainer = document.createElement("div");
            copyButtonContainer.className = "code-copy-container";

            const copyButton = document.createElement("button");
            copyButton.className = "code-copy-button";
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.title = "Copy code";

            copyButton.addEventListener("click", () => {
                navigator.clipboard.writeText(segment.content).then(() => {
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    copyButton.classList.add("copied");
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                        copyButton.classList.remove("copied");
                    }, 2000);
                });
            });

            copyButtonContainer.appendChild(copyButton);
            preElement.appendChild(copyButtonContainer);

            preElement.appendChild(codeElement);
            messageContent.appendChild(preElement);

            typeCodeContent(codeElement, segment.content, 0, () => {
                hljs.highlightElement(codeElement);
                startTypingEffect(messageContent, segments, segmentIndex + 1);
            });
        } else {
            const textDiv = document.createElement("div");
            messageContent.appendChild(textDiv);
            typeTextContent(textDiv, segment.content, 0, () => {
                startTypingEffect(messageContent, segments, segmentIndex + 1);
            });
        }
    }

    // Function to type code content letter by letter
    function typeCodeContent(element, content, index, callback) {
        if (stopGeneration) {
            callback();
            return;
        }
        if (index < content.length) {
            element.textContent += content[index];
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            letterTimeout = setTimeout(() => {
                typeCodeContent(element, content, index + 1, callback);
            }, typingSpeed);
        } else {
            callback();
        }
    }
    // Function to type text content letter by letter
    function typeTextContent(element, content, index, callback) {
        if (stopGeneration) {
            callback();
            return;
        }
        if (index < content.length) {
            let currentText = content.substring(0, index + 1);
            element.innerHTML = marked.parse(currentText);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            letterTimeout = setTimeout(() => {
                typeTextContent(element, content, index + 1, callback);
            }, typingSpeed);
        } else {
            callback();
        }
    }
    async function getChat() {
        try {
            const chat = await getData('/chat');
            console.log('chat history', chat);
            loadChat(chat['data']);
        } catch (error) {
            alert('Someting went wrong')
        }
    }

    // Function to toggle theme

}
// Function to update active chat in sidebar
function updateActiveChatInSidebar(currentChatId) {
    document.querySelectorAll(".chat-history-item").forEach((item) => {
        item.classList.remove("active");
        if (item.dataset.chatId === currentChatId) {
            item.classList.add("active");
        }
    });
}


function loadChatFromSidebar(id, chatHistory) {
    const messagesContainer = document.getElementById("messages");
    const currentChatTitle = document.getElementById("current-chat-title");
    const chat = chatHistory[id];
    currentChatTitle.textContent = chat?.title;
    messagesContainer.innerHTML = `
            <div class="intro-message">
                <h1>Welcome to AI Finance BaBa</h1>
                <p>Ask me anything. I'm powered by deepseek-r1.</p>
                <div class="suggestion-chips">
                    <button class="suggestion-chip">Tell me a story</button>
                    <button class="suggestion-chip">Explain quantum computing</button>
                    <button class="suggestion-chip">Write a poem</button>
                    <button class="suggestion-chip">Help me learn JavaScript</button>
                </div>
            </div>
          `;
    console.log('load chat', id, chatHistory, chat);
    updateActiveChatInSidebar(chat._id);

}
function updateChatHistorySidebar(chatHistory, currentChatId = '') {
    const chatHistoryContainer = document.getElementById("chat-history");
    chatHistoryContainer.innerHTML = "";
    chatHistory.forEach((chat, id) => {
        const chatId = chat._id
        const chatItem = document.createElement("div");
        chatItem.className = `chat-history-item ${chatId === currentChatId ? "active" : ""}`;
        chatItem.dataset.chatId = chatId;
        chatItem.dataset.id = chatId;
        // Create icon element
        const icon = document.createElement("i");
        icon.className = "fas fa-comment";
        // Create span for chat title using textContent for safety
        const titleSpan = document.createElement("span");
        titleSpan.textContent = chat.title;

        chatItem.appendChild(icon);
        chatItem.appendChild(titleSpan);

        chatItem.addEventListener("click", () => {
            loadChatFromSidebar(id, chatHistory);
        });
        chatHistoryContainer.appendChild(chatItem);

    });
}


export async function getChatTopics() {
    const chatHistory = await getData('/topics/user');
    updateChatHistorySidebar(chatHistory);


}

export async function logout() {
    if (confirm("Are you sure you want to logout?")) {
        const res = await getData('/user/logout');
        console.log(res);
        alert('Logout');
        location.reload();
    }
}

async function transactions() {
    let currentPage = 1;
    const rowsPerPage = 20;
    const transactionHistory = await getData('/transactions');
    renderTable()
    function renderTable() {
        const tableBody = document.getElementById("table-body");
        tableBody.innerHTML = "";

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = transactionHistory.slice(start, end);

        pageData.forEach((row, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
      <td>${getIndex(i)}</td>
      <td>${row.amount}</td>
      <td>${row.type}</td>
      <td>${row.source}</td>
      <td>${formatDateTimeWithAMPM(row.date)}</td>
    `;
            tableBody.appendChild(tr);
        });

        document.getElementById("page-info").innerText =
            `Page ${currentPage} of ${Math.ceil(transactionHistory.length / rowsPerPage)} / Total: ${transactionHistory.length}`;
    }

    // DOM Elements
    const nextPageButton = document.getElementById("next-page");
    const prevPageButton = document.getElementById("prev-page");
    nextPageButton.addEventListener("click", nextPage);
    prevPageButton.addEventListener("click", prevPage);
    function nextPage() {
        if (currentPage < Math.ceil(transactionHistory.length / rowsPerPage)) {
            currentPage++;
            renderTable();
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    }
    function getIndex(ind) {
        let i = ind + 1;
        return i + rowsPerPage * (currentPage - 1);
    }
}



function formatDateTime(date) {
    date = new Date(date);
    const pad = (num) => String(num).padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
function formatDateTimeWithAMPM(date) {
    date = new Date(date);
    const pad = (num) => String(num).padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    const formattedHours = pad(hours);

    return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}
async function chatRow() {
    let currentPage = 1;
    const rowsPerPage = 20;
    let chatHistory = await getData('/chat', { raw: true });
    chatHistory = chatHistory['data']
    console.log('chat history', chatHistory);
    renderTable()
    function renderTable() {
        const tableBody = document.getElementById("table-body");
        tableBody.innerHTML = "";

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = chatHistory.slice(start, end);

        pageData.forEach((row, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
      <td>${getIndex(i)}</td>
      <td>${row?.role=='assistant'?'AI Call-'+row?.role:row?.role}</td>
      <td>${row?.content}</td>
      <td>${formatDateTimeWithAMPM(row?.createdAt)}</td>
      <td>${getMetadata(row?.metadata)}</td>
    `;
            tableBody.appendChild(tr);
        });

        document.getElementById("page-info").innerText =
            `Page ${currentPage} of ${Math.ceil(chatHistory.length / rowsPerPage)} / Total: ${chatHistory.length}`;
    }

    // DOM Elements
    const nextPageButton = document.getElementById("next-page");
    const prevPageButton = document.getElementById("prev-page");
    nextPageButton.addEventListener("click", nextPage);
    prevPageButton.addEventListener("click", prevPage);
    function nextPage() {
        if (currentPage < Math.ceil(chatHistory.length / rowsPerPage)) {
            currentPage++;
            renderTable();
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    }
    function getIndex(ind) {
        let i = ind + 1;
        return i + rowsPerPage * (currentPage - 1);
    }

    function getMetadata(metadata){
        let mesg = metadata;
        try {
        mesg = metadata ? JSON.stringify(metadata, null, 2) : null
    } catch (error) {
      mesg = String(metadata)
    }
        return mesg
    }
}