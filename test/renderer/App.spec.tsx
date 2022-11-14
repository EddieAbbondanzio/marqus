import { act, fireEvent, render } from "@testing-library/react";
import { App } from "../../src/renderer/App";
import { createConfig } from "../__factories__/config";
import { createState } from "../__factories__/state";
import React from "react";
import { log } from "./../../src/renderer/logger";

jest.mock("./../../src/renderer/logger");

test("Uncaught errors are logged.", async () => {
  render(<App state={createState()} config={createConfig()} />);

  act(() => {
    fireEvent.error(window);
  });

  expect(log.error).toBeCalledWith("Uncaught Error:", undefined);
});
