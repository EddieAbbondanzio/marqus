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

export class NotFoundError extends Error {
  constructor(public messsage = "The requested resource was not found") {
    super(messsage);
  }
}
