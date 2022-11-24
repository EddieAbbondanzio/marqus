import { shell } from "electron";
import { openInBrowser } from "../../src/main/utils";

test("openInBrowser", async () => {
  openInBrowser("http://random-url-lol.com");
  expect(shell.openExternal).toHaveBeenCalledWith("http://random-url-lol.com");

  // TODO: Do we still want to support this?
  openInBrowser("random-url.com");
  expect(shell.openExternal).toHaveBeenCalledWith("http://random-url.com");
});
