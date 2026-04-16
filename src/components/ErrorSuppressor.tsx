'use client';

import { useEffect } from 'react';

/**
 * Component to suppress browser extension errors that don't affect functionality
 * These errors come from wallet extensions trying to inject into the page
 */
export default function ErrorSuppressor() {
  useEffect(() => {
    // Suppress specific console errors from browser extensions
    const originalError = console.error;
    console.error = (...args) => {
      // Filter out known extension errors that don't affect functionality
      const errorString = args.join(' ');
      
      const suppressedErrors = [
        'Cannot redefine property: ethereum',
        'The configured chains are not supported by Coinbase Smart Wallet',
        'evmAsk.js',
        'contentScript.js',
      ];
      
      // Only suppress if it matches our known extension errors
      if (suppressedErrors.some(err => errorString.includes(err))) {
        return; // Suppress this error
      }
      
      // Log all other errors normally
      originalError.apply(console, args);
    };

    // Cleanup on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
