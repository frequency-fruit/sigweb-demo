import { Suspense } from "react";
import { createRoot, type Root } from "react-dom/client";

/**
 * Define a base type for props to avoid using 'any' in the registry.
 */
export type IslandProps = Record<string, unknown>;

/**
 * Registry type: Mapping of component names to their implementations.
 */
export type ComponentRegistry = Record<string, React.ComponentType<IslandProps>>;

const roots = new Map<HTMLElement, Root>();

/**
 * Hydrates elements on the page that have the [data-react-island] attribute.
 */
export const hydrateIslands = (registry: ComponentRegistry): void => {
  const containers = document.querySelectorAll<HTMLElement>("[data-react-island]");

  containers.forEach((container) => {
    const componentKey = container.getAttribute("data-react-island");

    if (componentKey && componentKey in registry) {
      const Component = registry[componentKey];
      const rawProps = container.getAttribute("data-props") || "{}";

      try {
        const props = JSON.parse(rawProps) as IslandProps;
        let root = roots.get(container);

        if (!root) {
          root = createRoot(container);
          roots.set(container, root);
        }

        root.render(
          <Suspense fallback={<div className="island-loading">Loading Island...</div>}>
            <Component {...props} />
          </Suspense>,
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error(`[Hydrator] Error mounting "${componentKey}":`, errorMessage);
      }
    }
  });
};
