(window as any).ipc = jest.fn();

window.ResizeObserver = class {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
};

// jsdom doesn't support scrollIntoView
// https://stackoverflow.com/questions/53271193/typeerror-scrollintoview-is-not-a-function
window.HTMLElement.prototype.scrollIntoView = jest.fn();
