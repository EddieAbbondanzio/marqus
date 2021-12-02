export class InvalidOpError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
