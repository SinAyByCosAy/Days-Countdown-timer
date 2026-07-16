/* ================================================
   Remaining Days — New Tab Logic (Chrome MV3)
   Uses chrome.storage.local for persistence.
   ================================================ */

(function () {
  "use strict";

  // ---------- Storage adapter (chrome.storage.local with localStorage fallback for dev) ----------
  const STORAGE_KEY = "remainingDays_v1";

  const storage = {
    get() {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get([STORAGE_KEY], (res) => {
            resolve(res[STORAGE_KEY] || null);
          });
        } else {
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            resolve(raw ? JSON.parse(raw) : null);
          } catch {
            resolve(null);
          }
        }
      });
    },
    set(data) {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          resolve();
        }
      });
    },
    clear() {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove([STORAGE_KEY], resolve);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          resolve();
        }
      });
    },
  };

  // ---------- Elements ----------
  const el = {
    loading: document.getElementById("loading"),
    firstRun: document.getElementById("first-run"),
    firstRunForm: document.getElementById("first-run-form"),
    firstRunTarget: document.getElementById("first-run-target"),
    firstRunDays: document.getElementById("first-run-days"),
    dashboard: document.getElementById("dashboard"),
    daysNumber: document.getElementById("days-number"),
    percentValue: document.getElementById("percent-value"),
    progressFill: document.getElementById("progress-fill"),
    statMeta: document.getElementById("stat-meta"),
    heroTarget: document.getElementById("hero-target"),
    heroEyebrow: document.getElementById("hero-eyebrow"),
    nextGoalBtn: document.getElementById("next-goal-btn"),
    quoteText: document.getElementById("quote-text"),
    quoteAuthor: document.getElementById("quote-author"),
    settingsBtn: document.getElementById("settings-btn"),
    settingsModal: document.getElementById("settings-modal"),
    closeSettings: document.getElementById("close-settings"),
    settingsForm: document.getElementById("settings-form"),
    settingsTarget: document.getElementById("settings-target"),
    settingsDays: document.getElementById("settings-days"),
    settingsStart: document.getElementById("settings-start"),
    settingsLabel: document.getElementById("settings-label"),
    resetBtn: document.getElementById("reset-btn"),
  };

  // ---------- Utilities ----------
  const MS_DAY = 86_400_000;

  function toDateOnly(d) {
    // Local date at 00:00:00
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    return t;
  }

  function toISO(d) {
    // YYYY-MM-DD (local)
    const t = new Date(d);
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const day = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function parseISO(str) {
    // "YYYY-MM-DD" -> local Date at 00:00:00
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatShort(d) {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function dayOfYear(d = new Date()) {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start;
    return Math.floor(diff / MS_DAY);
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  // Days between today (local midnight) and an ISO YYYY-MM-DD
  function daysUntilISO(iso) {
    if (!iso) return null;
    const target = parseISO(iso);
    return Math.round((toDateOnly(target) - toDateOnly(new Date())) / MS_DAY);
  }

  // Convert a positive integer number of days into an ISO date (today + N)
  function isoFromDays(n) {
    const days = parseInt(n, 10);
    if (!Number.isFinite(days)) return "";
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + days);
    return toISO(d);
  }

  // Bind a bidirectional pair: date input <-> days input.
  function bindDateDaysPair(dateInput, daysInput) {
    dateInput.addEventListener("input", () => {
      if (!dateInput.value) return;
      const d = daysUntilISO(dateInput.value);
      if (d != null && d >= 0) daysInput.value = d;
    });
    daysInput.addEventListener("input", () => {
      const v = daysInput.value;
      if (v === "" || v == null) return;
      const iso = isoFromDays(v);
      if (iso) dateInput.value = iso;
    });
  }

  // ---------- State ----------
  let state = null; // { targetDate: "YYYY-MM-DD", startDate: "YYYY-MM-DD", label?: string }
  let tickerInterval = null;

  // ---------- Rendering ----------
  function show(id) {
    el.loading.classList.add("hidden");
    el.firstRun.classList.add("hidden");
    el.dashboard.classList.add("hidden");
    document.getElementById(id).classList.remove("hidden");
  }

  function renderQuote() {
    const quotes = window.REMAINING_DAYS_QUOTES || [];
    if (!quotes.length) return;
    const idx = dayOfYear() % quotes.length;
    const q = quotes[idx];
    el.quoteText.textContent = `"${q.text}"`;
    el.quoteAuthor.textContent = `— ${q.author}`;
  }

  function renderCountdown() {
    if (!state || !state.targetDate) return;

    const now = new Date();
    const target = parseISO(state.targetDate);
    const targetEnd = new Date(target);
    targetEnd.setHours(23, 59, 59, 999);
    const start = state.startDate ? parseISO(state.startDate) : parseISO(state.setOn || toISO(now));

    // Remaining days: ceil so partial days count as "1 remaining"
    const todayMid = toDateOnly(now);
    const targetMid = toDateOnly(target);
    const daysRemaining = Math.max(
      0,
      Math.round((targetMid - todayMid) / MS_DAY)
    );

    el.daysNumber.textContent = daysRemaining.toLocaleString();

    // Percentage passed — whole number floor
    const totalSpan = Math.max(1, targetEnd - start);
    const elapsed = Math.min(totalSpan, Math.max(0, now - start));
    const pct = (elapsed / totalSpan) * 100;
    const pctFloor = Math.floor(pct);
    el.percentValue.textContent = `${pctFloor}%`;
    el.progressFill.style.width = `${Math.min(100, pct)}%`;

    // Label
    const label = state.label && state.label.trim() ? state.label.trim() : formatShort(target);
    el.heroTarget.textContent = label;

    const isOver = now >= targetEnd;
    if (isOver) {
      el.heroEyebrow.textContent = "What is the next goal to crush?";
      el.nextGoalBtn.classList.remove("hidden");
      el.statMeta.textContent = `Completed · ${formatShort(start)} → ${formatShort(target)}`;
    } else {
      el.heroEyebrow.textContent = "Days remaining until";
      el.nextGoalBtn.classList.add("hidden");
      el.statMeta.textContent = `${pctFloor}% elapsed · ${formatShort(start)} → ${formatShort(target)}`;
    }
  }

  function startTicker() {
    if (tickerInterval) clearInterval(tickerInterval);
    renderCountdown();
    // Refresh once per minute — days & % change slowly, no need to tick every second
    tickerInterval = setInterval(renderCountdown, 60_000);
  }

  // ---------- Actions ----------
  async function saveNewTarget(targetISO, startISO, label) {
    const nowISO = toISO(new Date());
    const data = {
      targetDate: targetISO,
      startDate: startISO || null,
      setOn: (state && state.setOn) || nowISO,
      label: label || "",
    };
    // If it's a brand new record, capture setOn now
    if (!state) data.setOn = nowISO;
    // If user reset entirely, refresh setOn
    if (!state && !startISO) data.setOn = nowISO;
    state = data;
    await storage.set(state);
  }

  function openSettings() {
    if (state) {
      el.settingsTarget.value = state.targetDate || "";
      el.settingsDays.value = state.targetDate ? Math.max(0, daysUntilISO(state.targetDate)) : "";
      el.settingsStart.value = state.startDate || "";
      el.settingsLabel.value = state.label || "";
    } else {
      el.settingsTarget.value = "";
      el.settingsDays.value = "";
      el.settingsStart.value = "";
      el.settingsLabel.value = "";
    }
    el.settingsModal.classList.remove("hidden");
  }

  function closeSettingsModal() {
    el.settingsModal.classList.add("hidden");
  }

  // ---------- Event wiring ----------
  bindDateDaysPair(el.firstRunTarget, el.firstRunDays);
  bindDateDaysPair(el.settingsTarget, el.settingsDays);

  el.firstRunForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const val = el.firstRunTarget.value;
    if (!val) return;
    await saveNewTarget(val, "", "");
    show("dashboard");
    renderQuote();
    startTicker();
  });

  el.settingsBtn.addEventListener("click", openSettings);
  el.nextGoalBtn.addEventListener("click", openSettings);
  el.closeSettings.addEventListener("click", closeSettingsModal);
  el.settingsModal.addEventListener("click", (e) => {
    if (e.target === el.settingsModal) closeSettingsModal();
  });

  el.settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const target = el.settingsTarget.value;
    const start = el.settingsStart.value;
    const label = el.settingsLabel.value;
    if (!target) return;
    // Preserve setOn if it exists
    const data = {
      targetDate: target,
      startDate: start || null,
      setOn: (state && state.setOn) || toISO(new Date()),
      label: label || "",
    };
    state = data;
    await storage.set(state);
    closeSettingsModal();
    renderCountdown();
  });

  el.resetBtn.addEventListener("click", async () => {
    if (!confirm("Reset all settings and start over?")) return;
    await storage.clear();
    state = null;
    closeSettingsModal();
    show("first-run");
    el.firstRunForm.reset();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.settingsModal.classList.contains("hidden")) {
      closeSettingsModal();
    }
  });

  // Set sensible default for first-run date input (today + 365 days)
  (function initFirstRunDefault() {
    const soon = new Date();
    soon.setFullYear(soon.getFullYear() + 1);
    el.firstRunTarget.value = toISO(soon);
    el.firstRunDays.value = daysUntilISO(toISO(soon));
    // Prevent selecting past dates
    el.firstRunTarget.min = toISO(new Date());
    el.settingsTarget.min = toISO(new Date());
  })();

  // ---------- Init ----------
  (async function init() {
    renderQuote();
    const saved = await storage.get();
    if (saved && saved.targetDate) {
      state = saved;
      show("dashboard");
      startTicker();
    } else {
      show("first-run");
    }
  })();
})();
