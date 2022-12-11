import {
  HeadersReceivedResponse,
  OnHeadersReceivedListenerDetails,
  shell,
} from "electron";
import { Protocol } from "../shared/domain/protocols";

export function openInBrowser(url: string): Promise<void> {
  if (!url.startsWith("http")) {
    url = `http://${url}`;
  }
  return shell.openExternal(url);
}

export function setCspHeader(
  details: OnHeadersReceivedListenerDetails,
  callback: (headersReceivedResponse: HeadersReceivedResponse) => void,
): void {
  callback({
    responseHeaders: Object.assign(
      {
        ...details.responseHeaders,
        // Should be kept in sync with content security policy in forge.config.js
        "Content-Security-Policy": [`img-src * ${Protocol.Attachment}://*`],
      },
      details.responseHeaders,
    ),
  });
}
