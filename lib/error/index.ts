export class BigGoError extends Error {
  constructor(message: string, cause?: Error['cause']) {
    super(message, cause ? { cause } : undefined);
    this.name = this.constructor.name;
  }
}

export class BigGoAuthError extends Error {
  constructor(message: string, cause?: Error['cause']) {
    message = message.replace('( app_id )', '( clientID )');
    message = message.replace('( app_key )', '( clientSecret )');
    super(message, cause ? { cause } : undefined);
    this.name = this.constructor.name;
  }
}