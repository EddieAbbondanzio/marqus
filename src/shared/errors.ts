export class NotImplementedError extends Error {
  constructor(public message = "Not implemented") {
    super(message);
  }
}
