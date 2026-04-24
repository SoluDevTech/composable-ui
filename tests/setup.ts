import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock ResizeObserver (needed for Radix UI)
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock pointer capture (needed for Radix Select/Dialog)
HTMLElement.prototype.hasPointerCapture = vi.fn();
HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();

// Mock scrollIntoView (needed for Radix)
HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...(actual as object),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop === "string") {
            return (props: Record<string, unknown>) => {
              const { children, ...rest } = props;
              const filteredProps: Record<string, unknown> = {};
              for (const [key, value] of Object.entries(rest)) {
                if (
                  ![
                    "animate",
                    "initial",
                    "exit",
                    "transition",
                    "variants",
                    "whileHover",
                    "whileTap",
                    "whileInView",
                    "layout",
                    "layoutId",
                  ].includes(key)
                ) {
                  filteredProps[key] = value;
                }
              }
              return { type: prop, props: { ...filteredProps, children } };
            };
          }
          return undefined;
        },
      },
    ),
  };
});
