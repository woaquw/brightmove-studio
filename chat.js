/* Brightmove AI assistant widget.
   Talks to a Cloudflare Worker (see the brightmove-chat repo) that runs a free open-source LLM. */
(() => {
  const ENDPOINT = window.BRIGHTMOVE_CHAT_URL || "";
  const SUGGESTIONS = ["How much is a class?", "I'm a total beginner, where do I start?", "What's on Saturday?", "Can I come with back pain?"];
  const GREETING = "Hi! I'm the Brightmove assistant 👋 Ask me about classes, prices or the schedule.";

  const history = []; // { role, content }
  let busy = false;

  const root = document.createElement("div");
  root.className = "chat";
  root.innerHTML = `
    <button class="chat__launcher" aria-label="Open chat with the studio assistant" aria-expanded="false">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>
      <span class="chat__badge">1</span>
    </button>
    <section class="chat__panel" role="dialog" aria-label="Studio assistant" hidden>
      <header class="chat__head">
        <span class="chat__avatar" aria-hidden="true">B</span>
        <div><strong>Brightmove assistant</strong><small><span class="chat__online"></span>AI · replies instantly</small></div>
        <button class="chat__close" aria-label="Close chat">×</button>
      </header>
      <div class="chat__log" aria-live="polite"></div>
      <div class="chat__chips"></div>
      <form class="chat__form">
        <input class="chat__input" name="q" autocomplete="off" maxlength="500" placeholder="Ask about classes, prices…" aria-label="Your message">
        <button class="chat__send" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg></button>
      </form>
      <p class="chat__note">AI answers can be imperfect. For bookings use the form on the page.</p>
    </section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector(".chat__launcher");
  const panel = root.querySelector(".chat__panel");
  const log = root.querySelector(".chat__log");
  const chips = root.querySelector(".chat__chips");
  const form = root.querySelector(".chat__form");
  const input = root.querySelector(".chat__input");

  function open(state) {
    panel.hidden = !state;
    launcher.setAttribute("aria-expanded", String(state));
    root.classList.toggle("is-open", state);
    if (state) {
      root.querySelector(".chat__badge")?.remove();
      if (!log.children.length) addBubble("assistant", GREETING);
      setTimeout(() => input.focus(), 50);
    }
  }
  launcher.addEventListener("click", () => open(panel.hidden));
  root.querySelector(".chat__close").addEventListener("click", () => open(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) open(false); });

  SUGGESTIONS.forEach((s) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = s;
    b.addEventListener("click", () => send(s));
    chips.appendChild(b);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });

  function addBubble(role, text) {
    const el = document.createElement("div");
    el.className = `chat__msg chat__msg--${role}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  // Turns the reply into text + a "Book" button when the bot suggests booking.
  function finishReply(el, text) {
    el.textContent = text;
    if (/book|free (trial|class)|first class/i.test(text)) {
      const a = document.createElement("a");
      a.href = "#book";
      a.className = "chat__cta";
      a.textContent = "Book a free class →";
      a.addEventListener("click", () => window.innerWidth < 640 && open(false));
      el.appendChild(a);
    }
    log.scrollTop = log.scrollHeight;
  }

  async function send(raw) {
    const text = raw.trim();
    if (!text || busy) return;
    busy = true;
    input.value = "";
    chips.hidden = true;
    addBubble("user", text);
    history.push({ role: "user", content: text });

    const reply = addBubble("assistant", "");
    reply.classList.add("is-typing");
    reply.innerHTML = "<span></span><span></span><span></span>";

    let answer = "";
    try {
      if (!ENDPOINT) throw new Error("No endpoint configured");
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      // Read the Server-Sent Events stream and show the answer as it is written.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const raw = JSON.parse(data).response;
            // Numbers can arrive as JSON numbers (0 included), so check for null, not truthiness.
            const token = raw == null ? "" : String(raw);
            if (token) {
              if (!answer) { reply.classList.remove("is-typing"); reply.textContent = ""; }
              answer += token;
              reply.textContent = answer;
              log.scrollTop = log.scrollHeight;
            }
          } catch { /* partial line, wait for more */ }
        }
      }
      if (!answer.trim()) throw new Error("Empty answer");
      reply.classList.remove("is-typing");
      finishReply(reply, answer.trim());
      history.push({ role: "assistant", content: answer.trim() });
    } catch (err) {
      console.warn("Chat error:", err);
      reply.classList.remove("is-typing");
      reply.classList.add("is-error");
      reply.textContent = "Sorry, I can't answer right now. Please call (512) 555-0142 or use the booking form.";
      history.pop(); // let the visitor retry the same question
    } finally {
      busy = false;
      input.focus();
    }
  }
})();
