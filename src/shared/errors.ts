export class InvalidOpError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class NotImplementedError extends Error {
  constructor(public message = "Not implemented") {
    super(message);
  }
}
