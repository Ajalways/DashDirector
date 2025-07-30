import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// COMPREHENSIVE Firefox compatibility: Prevent Service Worker crashes
if (typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') !== -1) {
  console.log('Firefox detected - applying React compatibility fixes');
  
  // IMMEDIATELY block any Service Worker attempts before React starts
  if ('serviceWorker' in navigator) {
    try {
      Object.defineProperty(navigator, 'serviceWorker', {
        get: function() {
          console.log('Service Worker access blocked in main.tsx');
          return undefined;
        },
        configurable: true
      });
    } catch (e) {
      console.log('Service Worker already blocked by firefox-compatibility.js - this is expected');
    }
  }
  
  // Block Workers at the main.tsx level as well
  const originalWorker = window.Worker;
  if (originalWorker) {
    window.Worker = function() {
      console.log('Worker blocked in main.tsx for Firefox');
      throw new Error('Workers disabled for Firefox compatibility');
    };
  }
  
  // Override fetch with Firefox-safe headers
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (args[1]) {
      args[1].headers = {
        ...args[1].headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
    }
    return originalFetch.apply(this, args);
  };
  
  // Additional safety: Override any remaining problematic APIs
  if (typeof window.BroadcastChannel !== 'undefined') {
    window.BroadcastChannel = function() {
      throw new Error('BroadcastChannel disabled for Firefox compatibility');
    };
  }
}

createRoot(document.getElementById("root")!).render(<App />);
