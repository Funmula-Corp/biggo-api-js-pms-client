export class BigGoError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class BigGoAuthError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    message = message.replace('( app_id )', '( clientID )');
    message = message.replace('( app_key )', '( clientSecret )');
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}
