import React, { useEffect, useState } from "react";
import "@/App.css";
import AmbientBackground from "@/components/AmbientBackground";
import FirstRun from "@/components/FirstRun";
import Dashboard from "@/components/Dashboard";
import SettingsModal from "@/components/SettingsModal";
import { storage, toISO } from "@/lib/countdown";

export default function App() {
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const s = storage.get();
    setState(s);
    setLoaded(true);
  }, []);

  const save = ({ targetDate, startDate, label }) => {
    const data = {
      targetDate,
      startDate: startDate || null,
      setOn: (state && state.setOn) || toISO(new Date()),
      label: label || "",
    };
    storage.set(data);
    setState(data);
    setSettingsOpen(false);
  };

  const reset = () => {
    if (!window.confirm("Reset all settings and start over?")) return;
    storage.clear();
    setState(null);
    setSettingsOpen(false);
  };

  return (
    <div className="app-shell" data-testid="app-root">
      <AmbientBackground />
      <main className="app">
        {!loaded ? (
          <div className="loading" data-testid="loading-state">
            <span className="loading-dot" />
          </div>
        ) : state && state.targetDate ? (
          <Dashboard
            state={state}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        ) : (
          <FirstRun onSave={save} />
        )}
      </main>
      <SettingsModal
        open={settingsOpen}
        initial={state}
        onClose={() => setSettingsOpen(false)}
        onSave={save}
        onReset={reset}
      />
    </div>
  );
}
