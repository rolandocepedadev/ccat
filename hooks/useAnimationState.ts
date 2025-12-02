"use client";

import { useState, useEffect, useCallback } from "react";

interface AnimationState {
  hasInitialAnimationCompleted: boolean;
  forceAnimation: boolean;
  currentPage: string;
  skipAnimationOnReturn: boolean;
}

const STORAGE_KEY = "ccat-animation-state";
const SESSION_KEY = "ccat-last-activity";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Get initial state from localStorage
const getInitialState = (): AnimationState => {
  if (typeof window === "undefined") {
    return {
      hasInitialAnimationCompleted: false,
      forceAnimation: false,
      currentPage: "/",
      skipAnimationOnReturn: false,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if session is still valid
      const lastActivity = sessionStorage.getItem(SESSION_KEY);
      const now = Date.now();

      if (!lastActivity || now - parseInt(lastActivity) > SESSION_TIMEOUT) {
        // Session expired, reset state
        return {
          hasInitialAnimationCompleted: false,
          forceAnimation: false,
          currentPage: "/",
          skipAnimationOnReturn: parsed.skipAnimationOnReturn || false,
        };
      }

      return {
        hasInitialAnimationCompleted:
          parsed.hasInitialAnimationCompleted || false,
        forceAnimation: false, // Never persist force animation
        currentPage: parsed.currentPage || "/",
        skipAnimationOnReturn: parsed.skipAnimationOnReturn || false,
      };
    }
  } catch {
    // Failed to load animation state, using defaults
  }

  return {
    hasInitialAnimationCompleted: false,
    forceAnimation: false,
    currentPage: "/",
    skipAnimationOnReturn: false,
  };
};

// Save state to localStorage
const saveState = (state: AnimationState) => {
  if (typeof window === "undefined") return;

  try {
    // Update session activity
    sessionStorage.setItem(SESSION_KEY, Date.now().toString());

    // Save relevant state to localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        hasInitialAnimationCompleted: state.hasInitialAnimationCompleted,
        currentPage: state.currentPage,
        skipAnimationOnReturn: state.skipAnimationOnReturn,
      }),
    );
  } catch {
    // Failed to save animation state
  }
};

export const useAnimationState = () => {
  const [state, setState] = useState<AnimationState>(getInitialState);

  // Save state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Update session activity on mount and focus
  useEffect(() => {
    const updateActivity = () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      }
    };

    updateActivity();
    window.addEventListener("focus", updateActivity);
    window.addEventListener("visibilitychange", updateActivity);

    return () => {
      window.removeEventListener("focus", updateActivity);
      window.removeEventListener("visibilitychange", updateActivity);
    };
  }, []);

  const setInitialAnimationCompleted = useCallback((completed: boolean) => {
    setState((prev) => ({ ...prev, hasInitialAnimationCompleted: completed }));
  }, []);

  const setForceAnimation = useCallback((force: boolean) => {
    setState((prev) => ({ ...prev, forceAnimation: force }));
  }, []);

  const setCurrentPage = useCallback((page: string) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const setSkipAnimationOnReturn = useCallback((skip: boolean) => {
    setState((prev) => ({ ...prev, skipAnimationOnReturn: skip }));
  }, []);

  const shouldRunInitialAnimation = useCallback(
    (currentPath: string) => {
      // Always run if forced
      if (state.forceAnimation) {
        return true;
      }

      // Always run on first visit to home page
      if (currentPath === "/" && !state.hasInitialAnimationCompleted) {
        return true;
      }

      // Run if returning to home page from a different page
      if (
        currentPath === "/" &&
        state.currentPage !== "/" &&
        !state.skipAnimationOnReturn
      ) {
        return true;
      }

      return false;
    },
    [state],
  );

  const resetForNewSession = useCallback(() => {
    setState({
      hasInitialAnimationCompleted: false,
      forceAnimation: false,
      currentPage: "/",
      skipAnimationOnReturn: state.skipAnimationOnReturn, // Preserve user preference
    });
  }, [state.skipAnimationOnReturn]);

  const checkForNewSession = useCallback(() => {
    if (typeof window === "undefined") return false;

    const lastActivity = sessionStorage.getItem(SESSION_KEY);
    const now = Date.now();

    if (!lastActivity || now - parseInt(lastActivity) > SESSION_TIMEOUT) {
      resetForNewSession();
      sessionStorage.setItem(SESSION_KEY, now.toString());
      return true;
    }

    sessionStorage.setItem(SESSION_KEY, now.toString());
    return false;
  }, [resetForNewSession]);

  return {
    // State
    hasInitialAnimationCompleted: state.hasInitialAnimationCompleted,
    forceAnimation: state.forceAnimation,
    currentPage: state.currentPage,
    skipAnimationOnReturn: state.skipAnimationOnReturn,

    // Actions
    setInitialAnimationCompleted,
    setForceAnimation,
    setCurrentPage,
    setSkipAnimationOnReturn,
    shouldRunInitialAnimation,
    resetForNewSession,
    checkForNewSession,
  };
};

// Hook for detecting route changes in Next.js
export const useRouteChange = () => {
  const { setCurrentPage } = useAnimationState();

  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      setCurrentPage(currentPath);
    };

    // Listen for navigation events
    window.addEventListener("popstate", handleRouteChange);

    // Also check on mount
    handleRouteChange();

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [setCurrentPage]);
};

// Utility to force animation on next page load
export const forceNextAnimation = () => {
  if (typeof window === "undefined") return;

  try {
    const currentState = getInitialState();
    saveState({
      ...currentState,
      forceAnimation: true,
    });
  } catch {
    // Failed to set force animation
  }
};

// Utility to reset all animation state (useful for development)
export const resetAnimationState = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Failed to reset animation state
  }
};
