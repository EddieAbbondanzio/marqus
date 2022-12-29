import { shell } from "electron";
import { isChildOf, openInBrowser } from "../../src/main/utils";
import { setCspHeader } from "../../src/main/utils";

test("openInBrowser", async () => {
  await openInBrowser("http://random-url-lol.com");
  expect(shell.openExternal).toHaveBeenCalledWith("http://random-url-lol.com");

  // TODO: Do we still want to support this?
  await openInBrowser("random-url.com");
  expect(shell.openExternal).toHaveBeenCalledWith("http://random-url.com");
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

test.each([
  ["foo", "bar", false],
  ["foo", "foo/../../bar", false],
  ["foo", "foo/bar", true],
  ["foo", "foo/bar/baz.txt", true],
])("isChildOf", (parent, child, isChild) => {
  expect(isChildOf(parent, child)).toBe(isChild);
});
