// NUCLEAR OPTION: Complete Firefox compatibility by disabling everything problematic
(function() {
  'use strict';
  
  if (typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') !== -1) {
    console.log('Firefox NUCLEAR compatibility mode activated');
    
    // Completely disable the build process in Firefox by preventing Vite/build tools
    if (window.location.pathname.includes('build') || 
        window.location.search.includes('build') ||
        document.title.includes('build')) {
      
      document.body.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
          <h1 style="color: #ff6b6b;">Firefox Build Mode Disabled</h1>
          <p style="font-size: 18px; margin: 20px 0;">
            Firefox has compatibility issues with the build process due to Service Worker conflicts.
          </p>
          <p style="font-size: 16px; color: #666;">
            Please use Chrome, Edge, or Safari for building this application, or use the command line:
          </p>
          <code style="background: #f4f4f4; padding: 10px; display: block; margin: 20px; border-radius: 5px;">
            npm run build
          </code>
          <p style="margin-top: 30px;">
            <a href="/" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Return to Development Mode
            </a>
          </p>
        </div>
      `;
      
      // Stop all script execution
      throw new Error('Firefox build mode disabled for compatibility');
    }
    
    // If not in build mode, apply all previous compatibility measures
    // Complete Service Worker annihilation
    Object.defineProperty(window, 'ServiceWorker', { value: undefined });
    Object.defineProperty(window, 'ServiceWorkerRegistration', { value: undefined });
    Object.defineProperty(window, 'ServiceWorkerContainer', { value: undefined });
    
    // Disable ALL worker APIs
    window.Worker = undefined;
    window.SharedWorker = undefined;
    
    // Disable problematic storage APIs
    try {
      Object.defineProperty(window, 'indexedDB', { value: undefined });
      Object.defineProperty(window, 'webkitIndexedDB', { value: undefined });
      Object.defineProperty(window, 'mozIndexedDB', { value: undefined });
    } catch (e) {}
    
    // Disable cache APIs completely
    window.caches = undefined;
    
    // Override navigator completely for Firefox
    const firefoxSafeNavigator = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      // Explicitly remove ALL problematic properties
      serviceWorker: undefined,
      connection: undefined,
      storage: undefined,
      persistentStorage: undefined
    };
    
    // Replace navigator with safe version
    try {
      Object.keys(navigator).forEach(key => {
        if (!firefoxSafeNavigator.hasOwnProperty(key)) {
          Object.defineProperty(navigator, key, { value: undefined });
        }
      });
    } catch (e) {
      console.log('Navigator override partial - continuing');
    }
    
    // Prevent any build-related script loading
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(this, tagName);
      
      if (tagName.toLowerCase() === 'script') {
        element.addEventListener('beforeload', function(e) {
          if (this.src && (this.src.includes('worker') || this.src.includes('sw.js'))) {
            console.log('Blocked problematic script:', this.src);
            e.preventDefault();
            return false;
          }
        });
      }
      
      return element;
    };
    
    console.log('Firefox nuclear compatibility measures applied');
  }
})();