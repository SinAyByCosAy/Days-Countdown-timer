import React, { useState } from "react";
import { toISO } from "@/lib/countdown";

export default function FirstRun({ onSave }) {
  const soon = new Date();
  soon.setFullYear(soon.getFullYear() + 1);
  const [target, setTarget] = useState(toISO(soon));
  const today = toISO(new Date());

  const submit = (e) => {
    e.preventDefault();
    if (!target) return;
    onSave({ targetDate: target, startDate: null, label: "" });
  };

  return (
    <section className="first-run" data-testid="first-run-screen">
      <p className="eyebrow">A moment for pause</p>
      <h1 className="first-run-title">
        When is your <em>deadline</em>?
      </h1>
      <p className="first-run-sub">
        Set a date. This tab will remember you every time you open a new one.
      </p>
      <form className="first-run-form" onSubmit={submit} data-testid="first-run-form">
        <label className="field">
          <span className="field-label">Target date</span>
          <input
            type="date"
            required
            min={today}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="field-input"
            data-testid="first-run-target-input"
          />
        </label>
        <button
          type="submit"
          className="btn-primary"
          data-testid="first-run-submit"
        >
          Begin
        </button>
      </form>
    </section>
  );
}
