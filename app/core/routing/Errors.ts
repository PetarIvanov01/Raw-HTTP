class RequestError {
  constructor(public status: number) {
    this.status = status;
  }
}
export class RequestLineError extends RequestError {
  constructor(public status: number) {
    super(status);
    this.status = status;
  }
}
export class RequestHeadersError extends RequestError {
  constructor(public status: number) {
    super(status);
    this.status = status;
  }
}
