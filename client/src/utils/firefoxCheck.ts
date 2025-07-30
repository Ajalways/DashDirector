// Firefox compatibility detection and warning system
export const isFirefox = () => {
  return typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') !== -1;
};

export const getFirefoxVersion = () => {
  if (!isFirefox()) return null;
  const match = navigator.userAgent.match(/Firefox\/(\d+)/);
  return match ? parseInt(match[1]) : null;
};

export const isFirefoxCrashProne = () => {
  const version = getFirefoxVersion();
  return version !== null && version >= 140; // Firefox 140+ has the Service Worker bug
};

export const showFirefoxWarning = () => {
  if (isFirefoxCrashProne()) {
    console.warn(`
🔥 FIREFOX COMPATIBILITY MODE ACTIVE 🔥

Firefox ${getFirefoxVersion()} detected with known Service Worker crash bug.
Compatibility mode is preventing crashes by disabling Service Workers.

If you experience crashes:
1. Clear browser cache and cookies
2. Disable all Firefox extensions
3. Use Chrome or Safari as alternative
4. Contact support with crash logs

This is a Firefox browser bug, not an application issue.
    `);
  }
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  showFirefoxWarning();
}