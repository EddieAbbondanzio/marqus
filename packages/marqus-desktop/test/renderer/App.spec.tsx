import { act, fireEvent, render } from "@testing-library/react";
import { App } from "../../src/renderer/App";
import { createConfig } from "../__factories__/config";
import { createCache, createState } from "../__factories__/state";
import React from "react";
import { logger } from "../../src/renderer/logger";

jest.mock("./../../src/renderer/logger");

test("Uncaught errors are logged.", async () => {
  render(
    <App state={createState()} config={createConfig()} cache={createCache()} />,
  );

  act(() => {
    fireEvent.error(window);
  });

  expect(logger.error).toBeCalledWith("Uncaught Error:", undefined);
});
