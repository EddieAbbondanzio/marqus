export function isPromise<T>(promise?: any): promise is Promise<T> {
  return promise != null && typeof promise.then === "function";
}
