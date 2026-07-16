import React, { useEffect, useMemo, useState } from "react";
import { Settings } from "lucide-react";
import { computeCountdown, formatShort, dayOfYear } from "@/lib/countdown";
import { QUOTES } from "@/quotes";

export default function Dashboard({ state, onOpenSettings }) {
  // Refresh once per minute — days & percentage change slowly.
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const c = useMemo(() => computeCountdown(state, now), [state, now]);
  const percent = Math.floor(c.percent);

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
      <button
        type="button"
        className="icon-btn settings-corner"
        aria-label="Open settings"
        onClick={onOpenSettings}
        data-testid="settings-button"
      >
        <Settings size={20} strokeWidth={2} />
      </button>

      <div className="content-center">
        <p className="hero-eyebrow" data-testid="brand-label">
          {c.isOver ? "The horizon has arrived" : "Days remaining until"}
        </p>
        <p className="hero-target" data-testid="target-label">
          {label}
        </p>
        <h1 className="hero-number" data-testid="days-remaining">
          {c.daysRemaining.toLocaleString()}
        </h1>

        <div className="stat-block">
          <p className="stat-value" data-testid="percent-value">
            {percent}%
          </p>
          <div className="progress" aria-hidden="true">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, c.percent)}%` }}
              data-testid="progress-fill"
            />
          </div>
          <p className="stat-meta" data-testid="stat-meta">
            Elapsed · {formatShort(c.start)} → {formatShort(c.target)}
          </p>
        </div>

        <blockquote className="quote" data-testid="daily-quote">
          <p className="quote-text">"{quote.text}"</p>
          <cite className="quote-author">— {quote.author}</cite>
        </blockquote>
      </div>
    </section>
  );
}
