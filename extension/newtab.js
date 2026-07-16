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
    dashboard: document.getElementById("dashboard"),
    daysNumber: document.getElementById("days-number"),
    tickH: document.getElementById("tick-h"),
    tickM: document.getElementById("tick-m"),
    tickS: document.getElementById("tick-s"),
    percentValue: document.getElementById("percent-value"),
    progressFill: document.getElementById("progress-fill"),
    statMeta: document.getElementById("stat-meta"),
    heroTarget: document.getElementById("hero-target"),
    heroEyebrow: document.getElementById("hero-eyebrow"),
    todayLine: document.getElementById("today-line"),
    quoteText: document.getElementById("quote-text"),
    quoteAuthor: document.getElementById("quote-author"),
    settingsBtn: document.getElementById("settings-btn"),
    settingsModal: document.getElementById("settings-modal"),
    closeSettings: document.getElementById("close-settings"),
    settingsForm: document.getElementById("settings-form"),
    settingsTarget: document.getElementById("settings-target"),
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

  function renderTodayLine() {
    el.todayLine.textContent = formatDate(new Date());
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

    // Live H:M:S until end of the target day
    const msLeft = Math.max(0, targetEnd - now);
    const totalSeconds = Math.floor(msLeft / 1000);
    const hoursLeft = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutesLeft = Math.floor((totalSeconds % 3600) / 60);
    const secondsLeft = totalSeconds % 60;

    el.daysNumber.textContent = daysRemaining.toLocaleString();
    el.tickH.textContent = pad(hoursLeft);
    el.tickM.textContent = pad(minutesLeft);
    el.tickS.textContent = pad(secondsLeft);

    // Percentage passed
    const totalSpan = Math.max(1, targetEnd - start);
    const elapsed = Math.min(totalSpan, Math.max(0, now - start));
    const pct = (elapsed / totalSpan) * 100;
    el.percentValue.textContent = `${pct.toFixed(2)}%`;
    el.progressFill.style.width = `${Math.min(100, pct)}%`;

    // Label
    const label = state.label && state.label.trim() ? state.label.trim() : formatShort(target);
    el.heroTarget.textContent = label;
    el.heroEyebrow.textContent =
      now >= targetEnd ? "The horizon has arrived" : "Days remaining until";
    el.statMeta.textContent = `From ${formatShort(start)} → ${formatShort(target)}`;
  }

  function startTicker() {
    if (tickerInterval) clearInterval(tickerInterval);
    renderCountdown();
    tickerInterval = setInterval(renderCountdown, 1000);
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
      el.settingsStart.value = state.startDate || "";
      el.settingsLabel.value = state.label || "";
    }
    el.settingsModal.classList.remove("hidden");
  }

  function closeSettingsModal() {
    el.settingsModal.classList.add("hidden");
  }

  // ---------- Event wiring ----------
  el.firstRunForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const val = el.firstRunTarget.value;
    if (!val) return;
    await saveNewTarget(val, "", "");
    show("dashboard");
    renderQuote();
    renderTodayLine();
    startTicker();
  });

  el.settingsBtn.addEventListener("click", openSettings);
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
    // Prevent selecting past dates
    el.firstRunTarget.min = toISO(new Date());
    el.settingsTarget.min = toISO(new Date());
  })();

  // ---------- Init ----------
  (async function init() {
    renderQuote();
    renderTodayLine();
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
