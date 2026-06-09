import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { setLocale } from "./lib/format";

// Locale-aware date/number formatting follows the visitor's browser locale.
setLocale(typeof navigator !== "undefined" ? navigator.language : undefined);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline / installable (PWA). Registered after load so it never blocks first paint.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* offline support is best-effort */ });
  });
}
