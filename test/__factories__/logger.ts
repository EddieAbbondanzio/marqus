import { Logger } from "../../src/shared/logger";

export function createLogger(props?: Partial<Logger>): Logger {
  return {
    info: props?.info ?? jest.fn(),
    debug: props?.debug ?? jest.fn(),
    error: props?.error ?? jest.fn(),
    warn: props?.warn ?? jest.fn(),
  };
}
