import { useEffect, useCallback } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} keyMap - Object mapping keys to callback functions
 * @param {Array} deps - Dependencies array for the hook
 * 
 * Usage:
 * useKeyboardShortcuts({
 *   'Control+k': () => navigate('/chat'),
 *   'Control+i': () => navigate('/inventory'),
 *   'Escape': () => closeModal(),
 * });
 */
export function useKeyboardShortcuts(keyMap, deps = []) {
  const handleKeyDown = useCallback((event) => {
    const key = event.key;
    const ctrl = event.ctrlKey ? 'Control+' : '';
    const alt = event.altKey ? 'Alt+' : '';
    const shift = event.shiftKey ? 'Shift+' : '';
    const meta = event.metaKey ? 'Meta+' : '';
    
    const combo = `${ctrl}${alt}${shift}${meta}${key}`;
    
    // Check for exact match first
    if (keyMap[combo]) {
      event.preventDefault();
      keyMap[combo]();
      return;
    }
    
    // Check for key-only match (no modifiers)
    if (!ctrl && !alt && !shift && !meta && keyMap[key]) {
      // Don't prevent default for single keys unless explicitly needed
      keyMap[key]();
    }
  }, [keyMap]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, ...deps]);
}

/**
 * Hook to detect if the user is on a mobile/touch device
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    // Detect touch device
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTouch };
}

/**
 * Hook for click outside detection (for dropdowns, modals)
 */
export function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

/**
 * Hook for local storage with state sync
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Need to import useState for the hooks above
import { useState } from 'react';
