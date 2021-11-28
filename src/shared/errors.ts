export class UnsupportedError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
