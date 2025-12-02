"use client";

/**
 * Animation Trigger Utilities
 * Provides various methods to ensure animations run when needed
 */

import {
  forceNextAnimation,
  resetAnimationState,
} from "../hooks/useAnimationState";

// Animation trigger strategies
export enum AnimationTriggerStrategy {
  ALWAYS = "always",
  FIRST_VISIT = "first_visit",
  SESSION_BASED = "session_based",
  ROUTE_CHANGE = "route_change",
  MANUAL = "manual",
}

// Page visibility API integration
let isPageVisible = true;
let pageVisibilityHandlers: (() => void)[] = [];

if (typeof window !== "undefined") {
  const handleVisibilityChange = () => {
    isPageVisible = !document.hidden;

    // Trigger handlers when page becomes visible
    if (isPageVisible) {
      pageVisibilityHandlers.forEach((handler) => handler());
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleVisibilityChange);
}

/**
 * Force animation to run on next page load
 */
export const triggerAnimationOnNextLoad = () => {
  console.log("🎬 Animation will run on next page load");
  forceNextAnimation();
};

/**
 * Reset all animation state and force it to run
 */
export const resetAndTriggerAnimation = () => {
  console.log("🔄 Resetting animation state and triggering");
  resetAnimationState();

  // Force page reload to ensure clean state
  if (typeof window !== "undefined") {
    window.location.reload();
  }
};

/**
 * Trigger animation when page becomes visible (useful for tab switching)
 */
export const triggerAnimationOnVisibility = (callback: () => void) => {
  if (isPageVisible) {
    // Page is already visible, trigger immediately
    callback();
  } else {
    // Wait for page to become visible
    pageVisibilityHandlers.push(() => {
      callback();
      // Remove handler after execution
      pageVisibilityHandlers = pageVisibilityHandlers.filter(
        (h) => h !== callback,
      );
    });
  }
};

/**
 * Navigation-based animation trigger
 */
export const createNavigationTrigger = () => {
  let lastPathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

  const checkForNavigation = () => {
    if (typeof window === "undefined") return false;

    const currentPathname = window.location.pathname;
    const hasNavigated = currentPathname !== lastPathname;

    if (hasNavigated) {
      lastPathname = currentPathname;
      return true;
    }

    return false;
  };

  const onNavigateToHome = (callback: () => void) => {
    if (typeof window === "undefined") return;

    const checkNavigation = () => {
      if (window.location.pathname === "/" && checkForNavigation()) {
        callback();
      }
    };

    // Listen for navigation events
    window.addEventListener("popstate", checkNavigation);
    window.addEventListener("hashchange", checkNavigation);

    // Also check periodically (fallback for programmatic navigation)
    const interval = setInterval(checkNavigation, 1000);

    // Return cleanup function
    return () => {
      window.removeEventListener("popstate", checkNavigation);
      window.removeEventListener("hashchange", checkNavigation);
      clearInterval(interval);
    };
  };

  return { checkForNavigation, onNavigateToHome };
};

/**
 * Performance-aware animation trigger
 */
export const createPerformanceTrigger = () => {
  const isHighPerformanceDevice = () => {
    if (typeof window === "undefined") return true;

    const connection = (
      navigator as unknown as { connection?: { effectiveType: string } }
    ).connection;
    const memory = (
      performance as unknown as { memory?: { jsHeapSizeLimit: number } }
    ).memory;

    // Check various performance indicators
    const indicators = {
      goodConnection: !connection || connection.effectiveType === "4g",
      sufficientMemory:
        !memory || memory.jsHeapSizeLimit > 2 * 1024 * 1024 * 1024, // 2GB+
      multipleProcessors: (navigator.hardwareConcurrency || 0) >= 4,
      highDPR: window.devicePixelRatio >= 2,
    };

    // Device is high performance if most indicators are positive
    const positiveCount = Object.values(indicators).filter(Boolean).length;
    return positiveCount >= 2;
  };

  const triggerBasedOnPerformance = (
    highPerfCallback: () => void,
    lowPerfCallback?: () => void,
  ) => {
    if (isHighPerformanceDevice()) {
      highPerfCallback();
    } else if (lowPerfCallback) {
      lowPerfCallback();
    }
  };

  return { isHighPerformanceDevice, triggerBasedOnPerformance };
};

/**
 * Time-based animation trigger
 */
export const createTimeTrigger = () => {
  const triggerAfterDelay = (callback: () => void, delay: number = 100) => {
    const timeoutId = setTimeout(callback, delay);
    return () => clearTimeout(timeoutId);
  };

  const triggerOnIdle = (callback: () => void) => {
    if (typeof window === "undefined") {
      callback();
      return () => {};
    }

    if ("requestIdleCallback" in window) {
      const idleId = (
        window as unknown as { requestIdleCallback: (cb: () => void) => number }
      ).requestIdleCallback(callback);
      return () =>
        (
          window as unknown as { cancelIdleCallback: (id: number) => void }
        ).cancelIdleCallback(idleId);
    } else {
      // Fallback for browsers without requestIdleCallback
      return triggerAfterDelay(callback, 16); // Next frame
    }
  };

  const triggerOnNextFrame = (callback: () => void) => {
    if (typeof window === "undefined") {
      callback();
      return () => {};
    }

    const frameId = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(frameId);
  };

  return { triggerAfterDelay, triggerOnIdle, triggerOnNextFrame };
};

/**
 * DOM-ready animation trigger
 */
export const createDOMTrigger = () => {
  const triggerWhenReady = (callback: () => void) => {
    if (typeof window === "undefined") {
      callback();
      return;
    }

    if (document.readyState === "complete") {
      callback();
    } else {
      const handler = () => {
        callback();
        document.removeEventListener("readystatechange", handler);
      };
      document.addEventListener("readystatechange", handler);
    }
  };

  const triggerWhenFontsLoaded = async (callback: () => void) => {
    if (typeof window === "undefined") {
      callback();
      return;
    }

    try {
      await document.fonts.ready;
      callback();
    } catch (error) {
      console.warn("Font loading failed, proceeding anyway:", error);
      callback();
    }
  };

  const triggerWhenImagesLoaded = (
    container: HTMLElement,
    callback: () => void,
  ) => {
    const images = container.querySelectorAll("img");

    if (images.length === 0) {
      callback();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        callback();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.addEventListener("load", checkAllLoaded);
        img.addEventListener("error", checkAllLoaded); // Still proceed on error
      }
    });
  };

  return { triggerWhenReady, triggerWhenFontsLoaded, triggerWhenImagesLoaded };
};

/**
 * Composite trigger that combines multiple strategies
 */
export const createCompositeTrigger = () => {
  const { triggerOnNextFrame } = createTimeTrigger();
  const { triggerWhenFontsLoaded } = createDOMTrigger();
  const { isHighPerformanceDevice } = createPerformanceTrigger();

  const triggerWithOptimalTiming = (callback: () => void) => {
    const executeCallback = () => {
      if (isHighPerformanceDevice()) {
        // High performance: trigger immediately after fonts load
        triggerWhenFontsLoaded(callback);
      } else {
        // Lower performance: wait for next frame after fonts load
        triggerWhenFontsLoaded(() => {
          triggerOnNextFrame(callback);
        });
      }
    };

    // Ensure page is visible before triggering
    triggerAnimationOnVisibility(executeCallback);
  };

  return { triggerWithOptimalTiming };
};

/**
 * Debug utilities for development
 */
export const createDebugTriggers = () => {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return {};
  }

  // Global debug functions
  (
    window as unknown as { ccatAnimationTriggers?: unknown }
  ).ccatAnimationTriggers = {
    forceAnimation: triggerAnimationOnNextLoad,
    resetAndReload: resetAndTriggerAnimation,
    resetState: resetAnimationState,

    // Test different trigger strategies
    testAlways: () => {
      console.log("🧪 Testing ALWAYS strategy");
      resetAnimationState();
      setTimeout(() => window.location.reload(), 100);
    },

    testVisibility: () => {
      console.log("🧪 Testing visibility trigger - switch tabs and come back");
      triggerAnimationOnVisibility(() => {
        console.log("✅ Visibility trigger fired!");
      });
    },
  };

  console.log("🛠️ Debug triggers available on window.ccatAnimationTriggers");

  return (window as unknown as { ccatAnimationTriggers?: unknown })
    .ccatAnimationTriggers;
};

// Auto-initialize debug triggers in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  createDebugTriggers();
}

/**
 * Main trigger factory - creates the best trigger strategy for the given scenario
 */
export const createAnimationTrigger = (
  strategy: AnimationTriggerStrategy = AnimationTriggerStrategy.SESSION_BASED,
) => {
  const { triggerWithOptimalTiming } = createCompositeTrigger();
  const { onNavigateToHome } = createNavigationTrigger();

  switch (strategy) {
    case AnimationTriggerStrategy.ALWAYS:
      return {
        setup: (callback: () => void) => {
          resetAnimationState();
          triggerWithOptimalTiming(callback);
        },
        cleanup: () => {},
      };

    case AnimationTriggerStrategy.ROUTE_CHANGE:
      return {
        setup: (callback: () => void) => {
          return onNavigateToHome(() => {
            triggerAnimationOnNextLoad();
            triggerWithOptimalTiming(callback);
          });
        },
        cleanup: () => {},
      };

    case AnimationTriggerStrategy.MANUAL:
      return {
        setup: () => {},
        cleanup: () => {},
        trigger: (callback: () => void) => {
          triggerAnimationOnNextLoad();
          triggerWithOptimalTiming(callback);
        },
      };

    default: // SESSION_BASED
      return {
        setup: (callback: () => void) => {
          triggerWithOptimalTiming(callback);
        },
        cleanup: () => {},
      };
  }
};
