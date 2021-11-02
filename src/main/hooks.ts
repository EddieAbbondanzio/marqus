export type Callback = () => Promise<any>;
const onReadyCallbacks: Callback[] = [];

export function onReady(cb: Callback) {
  onReadyCallbacks.push(cb);
}

export async function notify() {
  await Promise.all(onReadyCallbacks.map((cb) => cb()));
}
