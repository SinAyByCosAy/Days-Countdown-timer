import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toISO } from "@/lib/countdown";

export default function SettingsModal({ open, initial, onClose, onSave, onReset }) {
  const [target, setTarget] = useState(initial?.targetDate || "");
  const [start, setStart] = useState(initial?.startDate || "");
  const [label, setLabel] = useState(initial?.label || "");
  const today = toISO(new Date());

  useEffect(() => {
    if (open && initial) {
      setTarget(initial.targetDate || "");
      setStart(initial.startDate || "");
      setLabel(initial.label || "");
    }
  }, [open, initial]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!target) return;
    onSave({ targetDate: target, startDate: start || null, label });
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      data-testid="settings-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h2 id="settings-title" className="modal-title">
            Adjust the horizon
          </h2>
          <button
            type="button"
            className="icon-btn small"
            aria-label="Close settings"
            onClick={onClose}
            data-testid="close-settings-button"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <form className="settings-form" onSubmit={submit} data-testid="settings-form">
          <label className="field">
            <span className="field-label">
              Target date <span className="req">*</span>
            </span>
            <input
              type="date"
              required
              min={today}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="field-input"
              data-testid="settings-target-input"
            />
          </label>
          <label className="field">
            <span className="field-label">
              Start date <span className="opt">(optional)</span>
            </span>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="field-input"
              data-testid="settings-start-input"
            />
            <span className="field-help">
              Leave blank to measure from the day you first set the target.
            </span>
          </label>
          <label className="field">
            <span className="field-label">
              Custom label <span className="opt">(optional)</span>
            </span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. My 30th birthday"
              maxLength={60}
              className="field-input"
              data-testid="settings-label-input"
            />
          </label>
          <div className="modal-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={onReset}
              data-testid="reset-button"
            >
              Reset all
            </button>
            <button
              type="submit"
              className="btn-primary"
              data-testid="save-settings-button"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
