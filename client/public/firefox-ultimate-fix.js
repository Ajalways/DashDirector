// ULTIMATE Firefox fix - Complete Service Worker elimination
(function() {
  'use strict';
  
  // Only run for Firefox
  if (navigator.userAgent.indexOf('Firefox') === -1) return;
  
  console.log('🔥 ULTIMATE Firefox fix activated');
  
  // NUCLEAR APPROACH: Completely remove Service Worker from window context
  try {
    // Method 1: Delete the property entirely
    delete window.navigator.serviceWorker;
    delete navigator.serviceWorker;
    
    // Method 2: Override the entire navigator object with a clean version
    const cleanNavigator = {};
    for (let key in navigator) {
      if (key !== 'serviceWorker') {
        try {
          cleanNavigator[key] = navigator[key];
        } catch (e) {
          // Skip non-accessible properties
        }
      }
    }
    
    // Method 3: Create a completely new navigator without serviceWorker
    Object.defineProperty(window, 'navigator', {
      value: new Proxy(navigator, {
        get(target, prop) {
          if (prop === 'serviceWorker') {
            console.log('Service Worker access completely blocked');
            return undefined;
          }
          return target[prop];
        },
        has(target, prop) {
          if (prop === 'serviceWorker') return false;
          return prop in target;
        }
      }),
      writable: false,
      configurable: true
    });
    
    console.log('✅ Service Worker completely eliminated from Firefox');
    
  } catch (e) {
    console.log('Navigator override failed, trying alternative method');
    
    // Alternative: Block at the prototype level
    if (Navigator && Navigator.prototype) {
      try {
        delete Navigator.prototype.serviceWorker;
        Object.defineProperty(Navigator.prototype, 'serviceWorker', {
          get: function() { return undefined; },
          configurable: false
        });
      } catch (e2) {
        console.log('Prototype blocking also failed - Firefox restrictions too strict');
      }
    }
  }
  
  // Final verification test
  setTimeout(() => {
    if ('serviceWorker' in navigator) {
      console.error('❌ FAILED: Service Worker still detected - manual intervention required');
      // Show user warning
      if (document.body) {
        const warning = document.createElement('div');
        warning.innerHTML = `
          <div style="position:fixed;top:0;left:0;right:0;background:#ff0000;color:#fff;padding:10px;z-index:999999;text-align:center;">
            ⚠️ FIREFOX CRASH RISK DETECTED ⚠️<br>
            Service Workers cannot be disabled. Please use Chrome or Safari to avoid crashes.
            <button onclick="this.parentElement.remove()" style="margin-left:10px;background:#fff;color:#000;border:none;padding:5px;">Close</button>
          </div>
        `;
        document.body.appendChild(warning);
      }
    } else {
      console.log('✅ SUCCESS: Service Worker completely eliminated');
    }
  }, 500);
  
})();