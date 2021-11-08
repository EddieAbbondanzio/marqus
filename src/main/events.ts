import { generateEventHook } from "../shared/events";

/*
 * onReady hook for the electron app event "ready"
 * Available on: Main
 */
export const [onReady, notifyOnReady] = generateEventHook();
