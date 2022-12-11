import { shell } from "electron";
import { openInBrowser } from "../../src/main/utils";
import { setCspHeader } from "../../src/main/utils";

test("openInBrowser", async () => {
  await openInBrowser("http://random-url-lol.com");
  expect(shell.openExternal).toHaveBeenCalledWith("http://random-url-lol.com");

  // TODO: Do we still want to support this?
  await openInBrowser("random-url.com");
  expect(shell.openExternal).toHaveBeenCalledWith("http://random-url.com");
});

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

test("setCspHeader", () => {
  const callback = jest.fn();
  setCspHeader({} as any, callback);
  expect(callback).toHaveBeenCalledWith({
    responseHeaders: {
      "Content-Security-Policy": [`img-src * attachment://*`],
    },
  });
});
