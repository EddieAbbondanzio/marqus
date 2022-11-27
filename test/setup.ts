(window as any).ipc = jest.fn();

window.ResizeObserver = class {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
};
