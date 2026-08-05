/* ═══════════════════════════════════════════════
   VolaLingo — Core Events System
   Lightweight pub/sub for decoupled module communication
   ═══════════════════════════════════════════════ */

const Events = (() => {
  const listeners = new Map();

  function on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(callback);
    return () => off(event, callback); // Return unsubscribe function
  }

  function off(event, callback) {
    if (listeners.has(event)) {
      listeners.get(event).delete(callback);
    }
  }

  function emit(event, ...args) {
    if (listeners.has(event)) {
      listeners.get(event).forEach(cb => {
        try {
          cb(...args);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }

  function once(event, callback) {
    const wrapper = (...args) => {
      off(event, wrapper);
      callback(...args);
    };
    on(event, wrapper);
  }

  return { on, off, emit, once };
})();

// Expose globally
window.Events = Events;