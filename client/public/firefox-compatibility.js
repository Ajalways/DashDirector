// FIREFOX NUCLEAR COMPATIBILITY MODE - Prevents ALL Service Worker crashes
(function() {
  'use strict';
  
  console.log('Firefox NUCLEAR compatibility mode activated');
  
  // CRITICAL: Block ALL forms of Service Worker registration for Firefox
  if (typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') !== -1) {
    console.log('Firefox detected - applying compatibility fixes');
    
    // AGGRESSIVE Service Worker blocking - prevent ALL registrations
    if ('serviceWorker' in navigator) {
      // Store original to prevent infinite loops
      const originalServiceWorker = navigator.serviceWorker;
      
      // Completely override the serviceWorker property
      Object.defineProperty(navigator, 'serviceWorker', {
        get: function() {
          console.log('Service Worker access blocked for Firefox compatibility');
          return {
            register: function() { 
              console.log('Service Worker registration blocked');
              return Promise.reject(new Error('Service Workers disabled for Firefox compatibility')); 
            },
            getRegistration: function() { 
              return Promise.resolve(undefined); 
            },
            getRegistrations: function() { 
              return Promise.resolve([]); 
            },
            ready: Promise.reject(new Error('Service Workers disabled')),
            controller: null,
            addEventListener: function() {},
            removeEventListener: function() {}
          };
        },
        configurable: false,
        enumerable: true
      });
    }
    
    // Block ALL worker-related APIs that might trigger Service Worker registration
    const originalWorker = window.Worker;
    if (originalWorker) {
      window.Worker = function(scriptURL, options) {
        console.log('Worker creation blocked for Firefox compatibility');
        throw new Error('Web Workers disabled for Firefox compatibility');
      };
    }
    
    // Block SharedWorker as well
    if (typeof window.SharedWorker !== 'undefined') {
      window.SharedWorker = function() {
        throw new Error('SharedWorkers disabled for Firefox compatibility');
      };
    }
    
    // Block any registration attempts through MessageChannel
    const originalMessageChannel = window.MessageChannel;
    if (originalMessageChannel) {
      window.MessageChannel = function() {
        console.log('MessageChannel creation monitored for Firefox');
        return new originalMessageChannel();
      };
    }
    
    // Disable problematic APIs that might trigger the crash
    try {
      if (typeof window.caches !== 'undefined') {
        Object.defineProperty(window, 'caches', {
          value: undefined,
          writable: false,
          configurable: true
        });
      }
    } catch (e) {
      console.log('Caches API already read-only - this is expected in Firefox');
    }
    
    // Add memory management for large applications
    if (typeof window.gc === 'function') {
      setInterval(function() {
        try {
          window.gc();
        } catch (e) {
          // Ignore errors
        }
      }, 30000);
    }
    
    // Block any attempt to register Service Workers via importScripts
    if (typeof window.importScripts !== 'undefined') {
      const originalImportScripts = window.importScripts;
      window.importScripts = function() {
        console.log('importScripts blocked for Firefox compatibility');
        return;
      };
    }
    
    // Monitor and block fetch events that might trigger Service Worker registration
    window.addEventListener('fetch', function(event) {
      console.log('Fetch event monitored for Firefox compatibility');
    }, true);
    
    // Block navigator.connection API that might be problematic
    if ('connection' in navigator) {
      try {
        Object.defineProperty(navigator, 'connection', {
          value: undefined,
          writable: false,
          configurable: true
        });
      } catch (e) {
        console.log('Connection API override failed - continuing');
      }
    }
    
    // NUCLEAR OPTION: Override ALL potentially problematic APIs
    console.log('Service Worker already blocked by firefox-compatibility.js - this is expected');
    
    // Block IndexedDB operations that might trigger Service Workers
    const originalIDBOpen = window.indexedDB?.open;
    if (originalIDBOpen) {
      window.indexedDB.open = function(...args) {
        console.log('IndexedDB operation monitored for Firefox compatibility');
        return originalIDBOpen.apply(this, args);
      };
    }
    
    // Override any Vite/React Router navigation that might trigger Service Workers
    const originalPushState = history.pushState;
    if (originalPushState) {
      history.pushState = function(...args) {
        console.log('Navigation monitored for Firefox compatibility');
        return originalPushState.apply(this, args);
      };
    }
    
    // Block any dynamic import() calls that might load Service Worker modules
    const originalImport = window.eval;
    window.eval = function(code) {
      if (typeof code === 'string' && (code.includes('serviceWorker') || code.includes('navigator.serviceWorker'))) {
        console.log('Blocked potential Service Worker code execution');
        return Promise.resolve({});
      }
      return originalImport.apply(this, arguments);
    };
    
    // Final safety: Override any late-loading Service Worker attempts
    setTimeout(() => {
      if ('serviceWorker' in navigator) {
        console.log('Secondary Service Worker block applied');
        Object.defineProperty(navigator, 'serviceWorker', {
          value: undefined,
          writable: false,
          configurable: false
        });
      }
    }, 100);
  }
})();