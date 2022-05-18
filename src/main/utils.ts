import { shell } from "electron";

export function openInBrowser(url: string): Promise<void> {
  if (!url.startsWith("http")) {
    url = `http://${url}`;
  }
  return shell.openExternal(url);
}
