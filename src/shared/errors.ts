export class InvalidOpError extends Error {
  constructor(public message: string = "Operation was invalid") {
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

export class NotSupportedError extends Error {
  constructor(public message = "Not supported") {
    super(message);
  }
}
