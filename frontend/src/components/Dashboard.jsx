import React, { useEffect, useMemo, useState } from "react";
import { Settings } from "lucide-react";
import {
  computeCountdown,
  formatLong,
  formatShort,
  pad,
  dayOfYear,
} from "@/lib/countdown";
import { QUOTES } from "@/quotes";

export default function Dashboard({ state, onOpenSettings }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const c = useMemo(() => computeCountdown(state, now), [state, now]);

  const quote = useMemo(() => {
    const idx = dayOfYear(now) % QUOTES.length;
    return QUOTES[idx];
  }, [now]);

  const label =
    state.label && state.label.trim()
      ? state.label.trim()
      : formatShort(c.target);

  return (
    <section className="dashboard" data-testid="dashboard-screen">
      <header className="top-bar">
        <div className="top-bar-left">
          <p className="brand" data-testid="brand-label">
            Remaining Days
          </p>
          <p className="today" data-testid="today-line">
            {formatLong(now)}
          </p>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label="Open settings"
          onClick={onOpenSettings}
          data-testid="settings-button"
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>
      </header>

      <div className="content-grid">
        <div className="hero">
          <p className="hero-eyebrow">
            {c.isOver ? "The horizon has arrived" : "Days remaining until"}
          </p>
          <p className="hero-target" data-testid="target-label">
            {label}
          </p>
          <h1 className="hero-number" data-testid="days-remaining">
            {c.daysRemaining.toLocaleString()}
          </h1>
          <div className="ticker" data-testid="ticker">
            <span>{pad(c.hoursLeft)}</span>
            <span className="tick-sep">:</span>
            <span>{pad(c.minutesLeft)}</span>
            <span className="tick-sep">:</span>
            <span>{pad(c.secondsLeft)}</span>
          </div>
        </div>

        <aside className="stats">
          <div className="stat-block">
            <p className="stat-label">Time elapsed</p>
            <p className="stat-value" data-testid="percent-value">
              {c.percent.toFixed(2)}%
            </p>
            <div className="progress" aria-hidden="true">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, c.percent)}%` }}
                data-testid="progress-fill"
              />
            </div>
            <p className="stat-meta" data-testid="stat-meta">
              From {formatShort(c.start)} → {formatShort(c.target)}
            </p>
          </div>

          <blockquote className="quote" data-testid="daily-quote">
            <p className="quote-text">"{quote.text}"</p>
            <cite className="quote-author">— {quote.author}</cite>
          </blockquote>
        </aside>
      </div>

      <footer className="bottom-bar">
        <p className="hint">
          <kbd>Click the gear</kbd> to change your dates. Persists across every
          new tab.
        </p>
      </footer>
    </section>
  );
}
