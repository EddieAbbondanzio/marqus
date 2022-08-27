export class NotImplementedError extends Error {
  constructor(public message = "Not implemented") {
    super(message);
  }
}

export class MissingDataDirectoryError extends Error {
  constructor(
    public message = "No data directory has been selected. Please pick one before using the app."
  ) {
    super(message);
  }
}
