import { useEffect, useState } from 'react';

interface KeyboardState {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

export const useKeyboardAvoid = () => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isKeyboardVisible: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    // Initial viewport height
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    let currentViewportHeight = initialViewportHeight;

    const handleViewportChange = () => {
      const newViewportHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - newViewportHeight;
      
      // Consider keyboard visible if viewport shrunk by more than 150px
      const isKeyboardVisible = heightDifference > 150;
      const keyboardHeight = isKeyboardVisible ? heightDifference : 0;

      setKeyboardState({
        isKeyboardVisible,
        keyboardHeight,
      });

      currentViewportHeight = newViewportHeight;
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Small delay to allow keyboard to appear
        setTimeout(() => {
          // Scroll the focused element into view
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 300);
      }
    };

    const handleFocusOut = () => {
      // Reset state when no input is focused
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA')) {
          setKeyboardState({
            isKeyboardVisible: false,
            keyboardHeight: 0,
          });
        }
      }, 100);
    };

    // Use Visual Viewport API if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleViewportChange);
    }

    // Add focus event listeners
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return keyboardState;
};