declare module 'hpp' {
  import { RequestHandler } from 'express';
  
  function hpp(options?: {
    whitelist?: string[];
    checkBody?: boolean;
    checkBodyOnlyForContentType?: string;
    checkQueryString?: boolean;
  }): RequestHandler;
  
  export = hpp;
}

