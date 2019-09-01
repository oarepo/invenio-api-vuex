class InvalidDataException extends Error {
  constructor(errors) {
    super(`Invalid input data at ${errors}`)
  }
}

export { InvalidDataException }
