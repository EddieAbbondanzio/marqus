export type Callback<P> = (p: P) => Promise<unknown>;

export type EventHook<P> = (cb: Callback<P>) => void;
export type EventNotify<P> = (p: P) => Promise<unknown[]>;

export function generateEventHook<P = void>(): [EventHook<P>, EventNotify<P>] {
  const listeners: Callback<P>[] = [];

  const hook = (cb: Callback<P>) => {
    listeners.push(cb);
  };

  const notify: EventNotify<P> = async (...args: any[]) =>
    Promise.all(listeners.map((cb) => cb(args[0])));

  return [hook, notify];
}
