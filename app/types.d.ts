export interface RequestLineOptions {
  method: string;
  pathname: string;
}

export interface RequestHeadersOptions {
  host: string;
  userAgent: string;
  accept: string;
  contentType?: string;
  contentLength?: number;
  contentEncoding?: string;
}

export interface RequestBody {
  body: any;
}

export interface Request
  extends RequestLineOptions,
    RequestHeadersOptions,
    RequestBody {
  rawData: string;
}
