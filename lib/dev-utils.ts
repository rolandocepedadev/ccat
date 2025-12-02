"use client";

/**
 * Development Utilities for Animation Testing
 * Provides tools for testing and debugging animation triggers
 */

import {
  resetAnimationState,
  forceNextAnimation,
} from "../hooks/useAnimationState";

interface DevAnimationControls {
  resetAndReload: () => void;
  forceAnimation: () => void;
  testVisibility: () => void;
  testRouteChange: () => void;
  simulateLowPerformance: () => void;
  restorePerformance: () => void;
  logState: () => void;
  enableDebugMode: () => void;
  disableDebugMode: () => void;
}

let debugMode: boolean;
let originalConnection: unknown = null;
let originalMemory: unknown = null;

/**
 * Log animation state for debugging
 */
const logAnimationState = () => {
  if (typeof window === "undefined") return;

  try {
    const storedState = localStorage.getItem("ccat-animation-state");
    const sessionActivity = sessionStorage.getItem("ccat-last-activity");

    console.group("🎬 Animation State Debug");
    console.log("Stored State:", storedState ? JSON.parse(storedState) : null);
    console.log(
      "Session Activity:",
      sessionActivity ? new Date(parseInt(sessionActivity)) : null,
    );
    console.log("Current Path:", window.location.pathname);
    console.log("Document Ready State:", document.readyState);
    console.log("Fonts Ready:", document.fonts?.status);
    console.groupEnd();
  } catch (error) {
    console.error("Failed to log animation state:", error);
  }
};

/**
 * Enable debug mode with enhanced logging
 */
const enableDebugMode = () => {
  if (typeof window === "undefined") return;

  debugMode = true;

  // Use debugMode to ensure it's not unused
  if (debugMode) {
    // Debug mode is now active
  }
  document.documentElement.setAttribute("data-debug-mode", "true");

  // Add debug styles
  const style = document.createElement("style");
  style.id = "ccat-debug-styles";
  style.textContent = `
    [data-debug-mode="true"] .crisp-header.is--loading::before {
      content: "🎬 ANIMATION LOADING...";
      position: fixed;
      top: 20px;
      left: 20px;
      background: #ff6b6b;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    [data-debug-mode="true"] .crisp-header:not(.is--loading)::before {
      content: "✅ ANIMATION COMPLETE";
      position: fixed;
      top: 20px;
      left: 20px;
      background: #51cf66;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      animation: fadeOut 3s forwards;
    }

    @keyframes fadeOut {
      0% { opacity: 1; }
      70% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  console.log(
    "🛠️ Debug mode enabled - Animation states will be visually indicated",
  );
};

/**
 * Disable debug mode
 */
const disableDebugMode = () => {
  if (typeof window === "undefined") return;

  debugMode = false;
  document.documentElement.removeAttribute("data-debug-mode");

  const debugStyles = document.getElementById("ccat-debug-styles");
  if (debugStyles) {
    debugStyles.remove();
  }

  console.log("🛠️ Debug mode disabled");
};

/**
 * Simulate low performance device for testing
 */
const simulateLowPerformance = () => {
  if (typeof window === "undefined") return;

  // Store original values
  originalConnection = (navigator as unknown as { connection?: unknown })
    .connection;
  originalMemory = (performance as unknown as { memory?: unknown }).memory;

  // Mock low performance indicators
  Object.defineProperty(navigator, "connection", {
    value: {
      effectiveType: "2g",
      downlink: 0.5,
      saveData: true,
    },
    configurable: true,
  });

  if (originalMemory) {
    Object.defineProperty(performance, "memory", {
      value: {
        ...originalMemory,
        jsHeapSizeLimit: 1024 * 1024 * 1024, // 1GB limit
      },
      configurable: true,
    });
  }

  console.warn(
    "🐌 Simulating low performance device - animations may be simplified",
  );
};

/**
 * Restore normal performance indicators
 */
const restorePerformance = () => {
  if (typeof window === "undefined") return;

  if (originalConnection) {
    Object.defineProperty(navigator, "connection", {
      value: originalConnection,
      configurable: true,
    });
  }

  if (originalMemory) {
    Object.defineProperty(performance, "memory", {
      value: originalMemory,
      configurable: true,
    });
  }

  console.log("🚀 Performance simulation restored");
};

/**
 * Test visibility-based animation trigger
 */
const testVisibilityTrigger = () => {
  console.log(
    "👁️ Testing visibility trigger - minimize/restore window or switch tabs",
  );

  let hasTriggered = false;

  const handleVisibilityChange = () => {
    if (!document.hidden && !hasTriggered) {
      console.log("✅ Visibility trigger activated!");
      hasTriggered = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Auto-cleanup after 30 seconds
  setTimeout(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    if (!hasTriggered) {
      console.log("⏰ Visibility test timed out");
    }
  }, 30000);
};

/**
 * Test route change animation trigger
 */
const testRouteChangeTrigger = () => {
  if (typeof window === "undefined") return;

  console.log("🛣️ Testing route change trigger");

  // Navigate away from home
  window.history.pushState({}, "", "/test-route");
  console.log("📍 Navigated to /test-route");

  // After 2 seconds, navigate back to home
  setTimeout(() => {
    window.history.pushState({}, "", "/");
    console.log("📍 Navigated back to / - animation should trigger");

    // Dispatch popstate event to simulate back/forward navigation
    window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
  }, 2000);
};

/**
 * Create dev animation controls
 */
const createDevAnimationControls = (): DevAnimationControls => {
  return {
    resetAndReload: () => {
      console.log("🔄 Resetting animation state and reloading page...");
      resetAnimationState();
      setTimeout(() => window.location.reload(), 100);
    },

    forceAnimation: () => {
      console.log("⚡ Forcing animation on next page load...");
      forceNextAnimation();
      setTimeout(() => window.location.reload(), 100);
    },

    testVisibility: testVisibilityTrigger,
    testRouteChange: testRouteChangeTrigger,
    simulateLowPerformance,
    restorePerformance,
    logState: logAnimationState,
    enableDebugMode,
    disableDebugMode,
  };
};

/**
 * Auto-setup development utilities
 */
const setupDevUtils = () => {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  const controls = createDevAnimationControls();

  // Expose utilities globally
  (window as unknown as { ccatDev?: unknown }).ccatDev = {
    ...controls,

    // Convenience methods
    quickTest: () => {
      enableDebugMode();
      logAnimationState();
      controls.forceAnimation();
    },

    help: () => {
      console.group("🛠️ CCAT Development Utilities");
      console.log("ccatDev.resetAndReload()    - Reset state and reload page");
      console.log("ccatDev.forceAnimation()    - Force animation on reload");
      console.log("ccatDev.testVisibility()    - Test visibility trigger");
      console.log("ccatDev.testRouteChange()   - Test route change trigger");
      console.log("ccatDev.simulateLowPerformance() - Simulate low-end device");
      console.log("ccatDev.restorePerformance() - Restore normal performance");
      console.log("ccatDev.logState()          - Log current animation state");
      console.log(
        "ccatDev.enableDebugMode()   - Enable visual debug indicators",
      );
      console.log("ccatDev.disableDebugMode()  - Disable debug mode");
      console.log("ccatDev.quickTest()         - Run quick test sequence");
      console.groupEnd();
    },
  };

  console.log(
    "🛠️ CCAT Dev Utils loaded! Type ccatDev.help() for available commands",
  );

  // Auto-enable debug mode if URL contains debug parameter
  if (window.location.search.includes("debug=true")) {
    enableDebugMode();
    console.log("🐛 Auto-enabled debug mode from URL parameter");
  }
};

// Auto-initialize in development
if (typeof window !== "undefined") {
  // Wait for window to be fully loaded
  if (document.readyState === "complete") {
    setupDevUtils();
  } else {
    window.addEventListener("load", setupDevUtils);
  }
}

export {
  createDevAnimationControls,
  setupDevUtils,
  enableDebugMode,
  disableDebugMode,
};
