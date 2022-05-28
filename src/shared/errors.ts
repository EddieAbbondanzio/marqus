export class NotImplementedError extends Error {
  constructor(public message = "Not implemented") {
    super(message);
  }
}

export class MissingDataDirectoryError extends Error {
  constructor(public message = "Data directoy was not found") {
    super(message);
  }
}
