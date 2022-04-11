// Mock IPC for testing
(window as any).ipc = {
  invoke: jest.fn(),
  _on: jest.fn(),
  _send: jest.fn(),
};
