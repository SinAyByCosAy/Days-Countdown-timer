import React from "react";

// Drifting ember orbs + film grain + vignette. Pure CSS, respects reduced motion.
export default function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true" data-testid="ambient-bg">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="grain" />
      <div className="vignette" />
    </div>
  );
}
