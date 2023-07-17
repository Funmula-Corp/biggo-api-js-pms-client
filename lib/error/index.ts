export class BigGoError extends Error {
  constructor(message: string, cause?: Error['cause']) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

export class BigGoAuthError extends Error {
  constructor(message: string, cause?: Error['cause']) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}