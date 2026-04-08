import '@testing-library/jest-dom';

// jsdom does not implement ResizeObserver — required by Recharts ResponsiveContainer
globalThis.ResizeObserver = class ResizeObserver {
  private cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) { this.cb = cb; }
  observe(target: Element) {
    // Simulate a non-zero bounding rect so Recharts renders
    this.cb([{ target, contentRect: { width: 800, height: 400 } } as ResizeObserverEntry], this);
  }
  unobserve() {}
  disconnect() {}
};

// Mock getBoundingClientRect to return non-zero dimensions
Element.prototype.getBoundingClientRect = () => ({
  width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {},
});
