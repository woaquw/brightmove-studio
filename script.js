document.documentElement.classList.remove("no-js");

/* ---------- Header: shadow on scroll + mobile menu ---------- */
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
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Schedule ---------- */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SCHEDULE = {
  Mon: [["07:30", "Mat Pilates", "Kasia", 3], ["12:15", "Mobility & Stretch", "Tomek", 6], ["18:30", "Reformer Flow", "Ania", 2], ["19:45", "Power Pilates", "Ania", 0]],
  Tue: [["07:00", "Reformer Flow", "Ola", 4], ["17:30", "Mat Pilates", "Kasia", 5], ["19:00", "Mobility & Stretch", "Tomek", 7]],
  Wed: [["07:30", "Power Pilates", "Ania", 1], ["12:15", "Mat Pilates", "Ola", 6], ["18:30", "Reformer Flow", "Kasia", 3], ["20:00", "Mobility & Stretch", "Tomek", 8]],
  Thu: [["07:00", "Reformer Flow", "Ola", 2], ["17:30", "Power Pilates", "Ania", 4], ["19:00", "Mat Pilates", "Kasia", 5]],
  Fri: [["07:30", "Mat Pilates", "Kasia", 6], ["12:15", "Reformer Flow", "Ola", 3], ["18:00", "Mobility & Stretch", "Tomek", 4]],
  Sat: [["09:30", "Reformer Flow", "Ania", 1], ["11:00", "Mat Pilates", "Ola", 5], ["12:30", "Power Pilates", "Ania", 3]],
  Sun: [["10:00", "Mobility & Stretch", "Tomek", 6], ["11:30", "Reformer Flow", "Kasia", 4]],
};

const tabsEl = document.getElementById("dayTabs");
const listEl = document.getElementById("scheduleList");
const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

function spotsLabel(n) {
  if (n === 0) return { text: "Full", cls: "is-full" };
  if (n <= 2) return { text: `${n} spot${n === 1 ? "" : "s"} left`, cls: "is-low" };
  return { text: `${n} spots left`, cls: "" };
}

function renderDay(day) {
  tabsEl.querySelectorAll(".tab").forEach((t) => {
    const active = t.dataset.day === day;
    t.setAttribute("aria-selected", String(active));
    t.tabIndex = active ? 0 : -1;
  });
  const slots = SCHEDULE[day] || [];
  listEl.innerHTML = "";
  if (!slots.length) {
    listEl.innerHTML = '<li class="schedule__empty">No classes on this day.</li>';
    return;
  }
  slots.forEach(([time, name, coach, spots]) => {
    const s = spotsLabel(spots);
    const li = document.createElement("li");
    li.className = "slot";
    li.innerHTML = `
      <span class="slot__time">${time}</span>
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
  btn.role = "tab";
  btn.dataset.day = day;
  btn.innerHTML = i === todayIdx ? `${day}<small>today</small>` : day;
  btn.addEventListener("click", () => renderDay(day));
  tabsEl.appendChild(btn);
});

// Arrow keys move between day tabs
tabsEl.addEventListener("keydown", (e) => {
  if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  const tabs = [...tabsEl.querySelectorAll(".tab")];
  const current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
  const next = (current + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next].click();
  tabs[next].focus();
});

renderDay(DAYS[todayIdx]);

/* ---------- Pre-fill the form from "Book" / "Choose" buttons ---------- */
const classSelect = document.getElementById("classType");
const planSelect = document.getElementById("plan");

document.addEventListener("click", (e) => {
  const classLink = e.target.closest("[data-class]");
  const planLink = e.target.closest("[data-plan]");
  if (classLink) classSelect.value = classLink.dataset.class;
  if (planLink) planSelect.value = planLink.dataset.plan;
});

/* ---------- Booking form ---------- */
const form = document.getElementById("bookingForm");
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
  const error = field.querySelector(".error");
  if (!error) return true;
  const ok = input.checkValidity();
  field.classList.toggle("has-error", !ok);
  input.setAttribute("aria-invalid", String(!ok));
  error.textContent = ok ? "" : messages[input.id] || "Please check this field.";
  return ok;
}

form.querySelectorAll("input, select").forEach((input) => {
  input.addEventListener("blur", () => { if (input.value || input.type === "checkbox") validateField(input); });
  input.addEventListener("input", () => {
    if (input.closest(".field")?.classList.contains("has-error")) validateField(input);
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form__status";

  const fields = [...form.querySelectorAll("input:not(#website), select")];
  const invalid = fields.filter((f) => !validateField(f));
  if (invalid.length) {
    invalid[0].focus();
    return;
  }

  // Bots fill the hidden field; pretend success and drop the request.
  if (form.elements["website"].value) {
    showSuccess();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  try {
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      const res = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } else {
      await new Promise((r) => setTimeout(r, 700)); // demo mode: no backend
    }
    showSuccess();
  } catch {
    statusEl.textContent = "Something went wrong. Please try again or call us.";
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
  statusEl.textContent = `Thanks, ${name}! We will confirm your class within one working day.`;
  statusEl.classList.add("is-ok");
}

document.getElementById("year").textContent = new Date().getFullYear();
