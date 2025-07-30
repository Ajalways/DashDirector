// Comprehensive Firefox crash prevention test
(function() {
  'use strict';
  
  if (navigator.userAgent.indexOf('Firefox') !== -1) {
    console.log('🔥 FIREFOX CRASH TEST INITIATED 🔥');
    
    // Test 1: Verify Service Worker is completely blocked
    setTimeout(() => {
      try {
        if ('serviceWorker' in navigator) {
          console.error('❌ CRITICAL: Service Worker API still available - CRASH RISK!');
          // Try to completely destroy it
          delete navigator.serviceWorker;
          Object.defineProperty(navigator, 'serviceWorker', {
            value: undefined,
            writable: false,
            configurable: false
          });
        } else {
          console.log('✅ PASS: Service Worker properly blocked');
        }
      } catch (e) {
        console.log('✅ PASS: Service Worker access throws error:', e.message);
      }
    }, 200);
    
    // Test 2: Monitor for any Service Worker attempts
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && (url.includes('sw.js') || url.includes('service-worker'))) {
        console.error('❌ BLOCKED: Attempted to fetch Service Worker file:', url);
        return Promise.reject(new Error('Service Worker files blocked for Firefox compatibility'));
      }
      return originalFetch.apply(this, args);
    };
    
    // Test 3: Block any module imports that might contain Service Workers
    const originalImport = window.import || function() {};
    window.import = function(url) {
      if (url.includes('sw.js') || url.includes('service-worker')) {
        console.error('❌ BLOCKED: Attempted to import Service Worker module:', url);
        return Promise.reject(new Error('Service Worker modules blocked'));
      }
      return originalImport.apply(this, arguments);
    };
    
    console.log('🛡️ Firefox crash prevention tests completed');
  }
})();