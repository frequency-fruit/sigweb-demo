import { lazy } from "react";
import { hydrateIslands, type ComponentRegistry, type IslandProps } from "./utils/island-hydrator";

const registry: ComponentRegistry = {
  UserProfile: lazy(
    () => import("./sample/UserProfile"),
  ) as unknown as React.ComponentType<IslandProps>,
  SigWebDemo: lazy(
    () => import("./sample/SigWebDemo"),
  ) as unknown as React.ComponentType<IslandProps>,
  LegacySignature: lazy(
    () => import("./sample/LegacySignature"),
  ) as unknown as React.ComponentType<IslandProps>,
  LegacySignatureAndDate: lazy(
    () => import("./sample/LegacySignatureAndDate"),
  ) as unknown as React.ComponentType<IslandProps>,
};

const syncSamples = () => hydrateIslands(registry);

// Initialize on DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", syncSamples);
} else {
  syncSamples();
}

// Add to existing global sync if it exists, or create it
const originalSync = window.syncReactIslands;
window.syncReactIslands = () => {
    if (typeof originalSync === 'function') originalSync();
    syncSamples();
};
