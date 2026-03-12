/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
  const body = await request.json();
  const message = body.message || "";

const systemPrompt = `
You are a helpful AI interview coach for graduate software engineering candidates.

Your role is to act like a realistic interviewer and coach.

If the user gives an interview-style answer, respond with:
1. A short overall comment
2. One strength
3. One improvement
4. One follow-up interview question

If the user asks a direct question, asks for help, says something short like "why", or seems confused, respond naturally in plain English and answer the question clearly.

Do not force every response into the same format.
Only use the feedback format when the user is clearly answering an interview question.

Be honest, supportive, and practical.
Keep responses clear and reasonably detailed, but not too long.
Write in plain text only.
Avoid markdown symbols like ** or bullet points unless really needed.
`;

  const result = await env.AI.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    }
  );

  return Response.json({
    reply: result.response || "Sorry, I could not generate feedback."
  });
}

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Interview Coach</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f7f7fb;
      color: #1f1f1f;
      margin: 0;
      padding: 40px 20px;
    }

    .container {
      max-width: 760px;
      margin: 0 auto;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    h1 {
      margin-top: 0;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #666;
      margin-bottom: 20px;
    }

    .chat-box {
      min-height: 260px;
      max-height: 420px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      background: #fafafa;
    }

    .message {
      padding: 10px 12px;
      border-radius: 8px;
      margin-bottom: 10px;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .message.user {
      background: #e8f1ff;
    }

    .message.assistant {
      background: #eef8ec;
    }

    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 12px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 12px;
      resize: vertical;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    button {
      border: none;
      background: #1a73e8;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    button.secondary {
      background: #666;
    }
  </style>
</head>
<body>
  <main class="container">
    <h1>AI Interview Coach</h1>
    <p class="subtitle">Practice interview answers and get short feedback.</p>

    <div id="chatBox" class="chat-box">
      <div class="message assistant">Hi, I’m your interview coach. Tell me what role you're preparing for, or ask me to start with a mock interview question.</div>
    </div>

    <textarea id="messageInput" rows="4" placeholder="Type your answer here..."></textarea>

    <div class="actions">
      <button id="sendBtn" type="button">Send</button>
      <button id="resetBtn" type="button" class="secondary">Reset</button>
    </div>
  </main>

 <script>
  window.addEventListener("load", function () {
    const chatBox = document.getElementById("chatBox");
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
    const resetBtn = document.getElementById("resetBtn");

    function addMessage(text, sender) {
      const div = document.createElement("div");
      div.className = "message " + sender;
      div.textContent = text;
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendMessage() {
      const text = messageInput.value.trim();
      if (!text) return;

      addMessage(text, "user");
      messageInput.value = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        addMessage(data.reply || "No reply received.", "assistant");
      } catch (error) {
        addMessage("Something went wrong.", "assistant");
      }
    }

    sendBtn.addEventListener("click", function () {
      sendMessage();
    });

    resetBtn.addEventListener("click", function () {
      chatBox.innerHTML = "";
      addMessage("Hi, I’m your interview coach. Tell me what role you’re preparing for, or ask me to start with a mock interview question.", "assistant");
      messageInput.value = "";
      messageInput.focus();
    });

    messageInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });

    messageInput.focus();
  });
</script>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};