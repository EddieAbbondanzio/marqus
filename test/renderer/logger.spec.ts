import { log } from "../../src/renderer/logger";
import { getProcessType, isTest } from "../../src/shared/env";

jest.mock("../../src/shared/env");

test("throws if imported outside of renderer", async () => {
  (isTest as jest.Mock).mockReturnValue(false);
  (getProcessType as jest.Mock).mockReturnValue("main");

  expect(() => require("../../src/renderer/logger")).toThrow(
    /window.ipc is null. Did you accidentally import logger.ts in the main thread?/
  );
});
