import React from "react";
import "@/index.css";

// Landing page — this Emergent preview only serves the downloadable Chrome extension.
// All extension source code lives in /app/extension/.
export default function App() {
  return (
    <div className="landing" data-testid="landing">
      <div className="landing-inner">
        <p className="tag">Chrome Extension · New Tab</p>
        <h1 className="hero">
          REMAINING <span className="accent">DAYS</span>
        </h1>
        <p className="sub">
          A cinematic mortality-clock that replaces your new tab. Set a date.
          Watch it burn. Make it count.
        </p>

        <a
          className="btn"
          href="/remaining-days-extension.zip"
          download
          data-testid="download-btn"
        >
          Download extension (.zip)
        </a>

        <ol className="steps">
          <li>
            <span className="step-num">01</span>
            Download &amp; unzip the file.
          </li>
          <li>
            <span className="step-num">02</span>
            Open{" "}
            <code>chrome://extensions</code> in Chrome.
          </li>
          <li>
            <span className="step-num">03</span>
            Toggle <b>Developer mode</b> on (top right).
          </li>
          <li>
            <span className="step-num">04</span>
            Click <b>Load unpacked</b> &amp; select the folder.
          </li>
          <li>
            <span className="step-num">05</span>
            Open a new tab. Set your date. Done.
          </li>
        </ol>

        <p className="footer-note">
          Source: <code>/app/extension/</code> — everything else in the repo is
          just this download page.
        </p>
      </div>
    </div>
  );
}
