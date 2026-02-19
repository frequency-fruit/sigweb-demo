import { lazy } from "react";
import "./index.css";
import { sigWebWrapper } from "./services/sigweb-wrapper";
import { hydrateIslands, type ComponentRegistry, type IslandProps } from "./utils/island-hydrator";

const registry: ComponentRegistry = {
  NotificationPanel: lazy(
    () => import("./components/NotificationPanel"),
  ) as unknown as React.ComponentType<IslandProps>,
};

/**
 * Extend the Window interface globally to avoid 'any' casting
 */
declare global {
  interface Window {
    syncReactIslands: () => void;
    sigWebWrapper: typeof sigWebWrapper;
  }
}

const sync = () => hydrateIslands(registry);

// Initialize on DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", sync);
} else {
  sync();
}

window.syncReactIslands = sync;
window.sigWebWrapper = sigWebWrapper;
