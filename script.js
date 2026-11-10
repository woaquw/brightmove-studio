document.documentElement.classList.remove("no-js");

/* ---------- Data ---------- */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// [time (24h), class, coach, spots left]
const SCHEDULE = {
  Mon: [["06:30", "Mat Pilates", "Emma", 3], ["12:15", "Mobility & Stretch", "Noah", 6], ["18:30", "Reformer Flow", "Mia", 2], ["19:45", "Power Pilates", "Mia", 0]],
  Tue: [["07:00", "Reformer Flow", "Jess", 4], ["12:15", "Mat Pilates", "Emma", 5], ["17:30", "Power Pilates", "Mia", 3], ["19:00", "Mobility & Stretch", "Noah", 7]],
  Wed: [["06:30", "Power Pilates", "Mia", 1], ["12:15", "Reformer Flow", "Jess", 6], ["18:30", "Reformer Flow", "Emma", 3], ["20:00", "Mobility & Stretch", "Noah", 8]],
  Thu: [["07:00", "Reformer Flow", "Jess", 2], ["12:15", "Mobility & Stretch", "Noah", 5], ["17:30", "Power Pilates", "Mia", 4], ["19:00", "Mat Pilates", "Emma", 5]],
  Fri: [["06:30", "Mat Pilates", "Emma", 6], ["12:15", "Reformer Flow", "Jess", 3], ["18:00", "Mobility & Stretch", "Noah", 4]],
  Sat: [["08:30", "Reformer Flow", "Mia", 1], ["10:00", "Mat Pilates", "Jess", 5], ["11:30", "Power Pilates", "Mia", 3]],
  Sun: [["09:00", "Mobility & Stretch", "Noah", 6], ["10:30", "Reformer Flow", "Emma", 4]],
};

const CLASSES = {
  "Reformer Flow": {
    img: "https://images.unsplash.com/photo-1747240549807-fc3962949818?w=400&q=70&auto=format",
    why: "Full-body strength on the reformer. The springs support you, so it is safe for beginners and still challenging for regulars.",
  },
  "Mat Pilates": {
    img: "https://images.unsplash.com/photo-1763403921315-f2ef8697199f?w=400&q=70&auto=format",
    why: "The best place to start: you learn core control and posture step by step, which is exactly what helps with back pain.",
  },
  "Mobility & Stretch": {
    img: "https://images.unsplash.com/photo-1552196527-bffef41ef674?w=400&q=70&auto=format",
    why: "Slow, deep work on hips, spine and shoulders. You will feel looser after the very first class.",
  },
  "Power Pilates": {
    img: "https://images.unsplash.com/photo-1747239685045-fcbcf98985db?w=400&q=70&auto=format",
    why: "Faster tempo, heavier springs and short cardio bursts. Expect to sweat and feel it the next day.",
  },
};

const now = new Date();
const todayIdx = (now.getDay() + 6) % 7; // Monday = 0
const toMinutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
function fmtTime(t) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}
function spotsLabel(n) {
  if (n === 0) return { text: "Full", cls: "is-full" };
  if (n <= 2) return { text: `Only ${n} spot${n === 1 ? "" : "s"} left`, cls: "is-low" };
  return { text: `${n} spots left`, cls: "" };
}

/* Upcoming slots across the next 7 days, starting from now */
function upcomingSlots() {
  const list = [];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let offset = 0; offset < 7; offset++) {
    const dayIdx = (todayIdx + offset) % 7;
    const day = DAYS[dayIdx];
    SCHEDULE[day].forEach(([time, name, coach, spots]) => {
      if (offset === 0 && toMinutes(time) <= nowMin) return;
      list.push({ offset, dayIdx, day, time, name, coach, spots });
    });
  }
  return list;
}
const dayLabel = (s) => (s.offset === 0 ? "Today" : s.offset === 1 ? "Tomorrow" : s.day);

/* ---------- Header + mobile menu ---------- */
const header = document.querySelector(".header");
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function setMenu(open) {
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav.classList.toggle("is-open", open);
}
burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Hero "next class" card + promo counter ---------- */
const next = upcomingSlots().find((s) => s.spots > 0);
if (next) {
  document.getElementById("nextClassName").textContent = `Next: ${next.name}`;
  document.getElementById("nextClassMeta").textContent =
    `${dayLabel(next)} · ${fmtTime(next.time)} · ${spotsLabel(next.spots).text.toLowerCase()}`;
}
// Trial spots shrink during the week so the offer feels current.
document.getElementById("promoSpots").textContent = `${Math.max(2, 8 - todayIdx)} trial spots`;

/* ---------- Schedule ---------- */
const tabsEl = document.getElementById("dayTabs");
const listEl = document.getElementById("scheduleList");

function renderDay(day) {
  tabsEl.querySelectorAll(".tab").forEach((t) => {
    const active = t.dataset.day === day;
    t.setAttribute("aria-selected", String(active));
    t.tabIndex = active ? 0 : -1;
  });
  listEl.innerHTML = "";
  SCHEDULE[day].forEach(([time, name, coach, spots]) => {
    const s = spotsLabel(spots);
    const li = document.createElement("li");
    li.className = "slot";
    li.innerHTML = `
      <span class="slot__time">${fmtTime(time)}</span>
      <span class="slot__name">${name}<span class="slot__coach">with ${coach} · 55 min</span></span>
      <span class="slot__spots ${s.cls}">${s.text}</span>
      ${spots === 0
        ? '<button class="btn btn--ghost" type="button" disabled>Full</button>'
        : `<a class="btn btn--ghost" href="#book" data-class="${name}">Book</a>`}`;
    listEl.appendChild(li);
  });
}

DAYS.forEach((day, i) => {
  const btn = document.createElement("button");
  btn.className = "tab";
  btn.type = "button";
  btn.setAttribute("role", "tab");
  btn.dataset.day = day;
  btn.innerHTML = i === todayIdx ? `${day}<small>today</small>` : day;
  btn.addEventListener("click", () => renderDay(day));
  tabsEl.appendChild(btn);
});
tabsEl.addEventListener("keydown", (e) => {
  if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  const tabs = [...tabsEl.querySelectorAll(".tab")];
  const current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
  const nextTab = tabs[(current + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
  nextTab.click();
  nextTab.focus();
});
renderDay(DAYS[todayIdx]);

/* ---------- Quiz ---------- */
const quiz = { goal: null, level: null, time: null };
const steps = [...document.querySelectorAll(".quiz__step")];
const bar = document.getElementById("quizBar");

function showStep(name) {
  steps.forEach((s) => s.classList.toggle("is-active", s.dataset.step === name));
  const idx = ["goal", "level", "time", "result"].indexOf(name);
  bar.style.width = `${(idx / 3) * 100}%`;
}

function pickClass({ goal, level }) {
  if (goal === "flex") return "Mobility & Stretch";
  if (goal === "back") return level === "new" ? "Mat Pilates" : "Reformer Flow";
  if (goal === "energy") return level === "new" ? "Reformer Flow" : "Power Pilates";
  return level === "regular" ? "Power Pilates" : "Reformer Flow";
}

function matchesTime(slot, time) {
  const m = toMinutes(slot.time);
  const weekend = slot.dayIdx >= 5;
  if (time === "weekend") return weekend;
  if (weekend) return false;
  if (time === "morning") return m < 11 * 60;
  if (time === "midday") return m >= 11 * 60 && m < 15 * 60;
  return m >= 17 * 60;
}

function showResult() {
  const name = pickClass(quiz);
  const info = CLASSES[name];
  const all = upcomingSlots().filter((s) => s.name === name && s.spots > 0);
  const preferred = all.filter((s) => matchesTime(s, quiz.time));
  const slots = (preferred.length ? preferred : all).slice(0, 3);

  document.getElementById("resultName").textContent = name;
  document.getElementById("resultWhy").textContent = info.why;
  const img = document.getElementById("resultImg");
  img.src = info.img;
  img.alt = `${name} class`;
  document.getElementById("resultSlots").innerHTML = slots
    .map((s) => `<li><strong>${dayLabel(s)}, ${fmtTime(s.time)}</strong> · with ${s.coach} · ${spotsLabel(s.spots).text.toLowerCase()}</li>`)
    .join("") + (preferred.length ? "" : '<li>No slots at your preferred time this week, here are the closest ones.</li>');
  document.getElementById("resultBook").dataset.class = name;
  showStep("result");
}

document.querySelectorAll(".quiz__step[data-step] .quiz__options button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const step = btn.closest(".quiz__step").dataset.step;
    quiz[step] = btn.dataset.value;
    if (step === "goal") showStep("level");
    else if (step === "level") showStep("time");
    else showResult();
  });
});
document.getElementById("quizRestart").addEventListener("click", () => {
  quiz.goal = quiz.level = quiz.time = null;
  showStep("goal");
});

/* ---------- Pre-fill the form from any "Book" / "Choose" button ---------- */
const form = document.getElementById("bookingForm");
const classSelect = document.getElementById("classType");
const planSelect = document.getElementById("plan");

document.addEventListener("click", (e) => {
  const classLink = e.target.closest("[data-class]");
  const planLink = e.target.closest("[data-plan]");
  if (classLink) classSelect.value = classLink.dataset.class;
  if (planLink) planSelect.value = planLink.dataset.plan;
  if (classLink || planLink) {
    form.classList.remove("is-highlight");
    void form.offsetWidth; // restart the animation
    form.classList.add("is-highlight");
  }
});

/* ---------- Sticky mobile CTA: visible between the hero and the form ---------- */
const sticky = document.getElementById("stickyCta");
if ("IntersectionObserver" in window) {
  let heroVisible = true;
  let bookVisible = false;
  const update = () => sticky.classList.toggle("is-visible", !heroVisible && !bookVisible);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(document.querySelector(".hero"));
  new IntersectionObserver(([e]) => { bookVisible = e.isIntersecting; update(); }).observe(document.getElementById("book"));
}

/* ---------- Booking form ---------- */
const statusEl = document.getElementById("formStatus");
const submitBtn = form.querySelector('button[type="submit"]');
const messages = {
  name: "Please enter your name.",
  email: "Please enter a valid email, e.g. name@example.com.",
  phone: "Use digits, spaces and + only.",
  classType: "Please choose a class.",
  consent: "Please confirm so we can contact you.",
};

function validateField(input) {
  const field = input.closest(".field");
  const error = field && field.querySelector(".error");
  if (!error) return true;
  const ok = input.checkValidity();
  field.classList.toggle("has-error", !ok);
  input.setAttribute("aria-invalid", String(!ok));
  error.textContent = ok ? "" : messages[input.id] || "Please check this field.";
  return ok;
}

form.querySelectorAll("input, select").forEach((input) => {
  input.addEventListener("blur", () => { if (input.value || input.type === "checkbox") validateField(input); });
  input.addEventListener("input", () => { if (input.closest(".field")?.classList.contains("has-error")) validateField(input); });
  input.addEventListener("change", () => { if (input.closest(".field")?.classList.contains("has-error")) validateField(input); });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form__status";

  const fields = [...form.querySelectorAll("input:not(#website), select")];
  const invalid = fields.filter((f) => !validateField(f));
  if (invalid.length) { invalid[0].focus(); return; }

  if (form.elements["website"].value) { showSuccess(); return; } // bot filled the honeypot

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  try {
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      const res = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } else {
      await new Promise((r) => setTimeout(r, 700)); // demo mode: no backend
    }
    showSuccess();
  } catch {
    statusEl.textContent = "Something went wrong. Please try again or give us a call.";
    statusEl.classList.add("is-error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Request my free class";
  }
});

function showSuccess() {
  const name = form.elements["name"].value.trim().split(" ")[0] || "there";
  form.reset();
  form.querySelectorAll(".has-error").forEach((f) => f.classList.remove("has-error"));
  form.querySelectorAll("[aria-invalid]").forEach((f) => f.removeAttribute("aria-invalid"));
  statusEl.textContent = `Thanks, ${name}! We will confirm your free class within one business day.`;
  statusEl.classList.add("is-ok");
}

document.getElementById("year").textContent = now.getFullYear();
