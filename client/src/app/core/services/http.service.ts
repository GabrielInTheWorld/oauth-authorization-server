import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

export interface Answer {
  success: boolean;
  message?: string;
}

export enum HTTPMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete'
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly defaultHeaders: HttpHeaders;

  private readonly serverURL: string;

  public constructor(private readonly http: HttpClient) {
    this.defaultHeaders = new HttpHeaders().set('Content-Type', 'application/json').set('Accept', 'application/json');
    this.serverURL = this.getServerURL();
  }

  /**
   * Send the a http request the the given path.
   * Optionally accepts a request body.
   *
   * @param path the target path, usually starting with /rest
   * @param method the required HTTP method (i.e get, post, put)
   * @param data optional, if sending a data body is required
   * @param customHeader optional custom HTTP header of required
   * @param responseType optional response type, default set to json (i.e 'arraybuffer')
   * @returns a promise containing a generic
   */
  private async send<T = Answer>(
    path: string,
    method: HTTPMethod,
    data?: any,
    customHeader?: HttpHeaders,
    responseType?: string
  ): Promise<T> {
    if (!responseType) {
      responseType = 'json';
    }

    const url = path.startsWith('/') ? `${this.serverURL}${path}` : `${this.serverURL}/${path}`;
    // const url = path;

    const options = {
      body: data,
      headers: customHeader ? customHeader : this.defaultHeaders,
      withCredentials: false,
      responseType: responseType as 'json'
    };

    try {
      return await this.http.request<T>(method, url, options).toPromise();
    } catch (e) {
      // throw this.handleError(e);
    }
  }

  /**
   * Executes a get on a path with a certain object
   * @param path The path to send the request to.
   * @param data An optional payload for the request.
   * @param header optional HTTP header if required
   * @param responseType option expected response type by the request (i.e 'arraybuffer')
   * @returns A promise holding a generic
   */
  public async get<T = Answer>(path: string, data?: any, header?: HttpHeaders, responseType?: string): Promise<T> {
    return await this.send<T>(path, HTTPMethod.GET, data, header, responseType);
  }

  public async post<T = Answer>(path: string, data?: any, header?: HttpHeaders): Promise<T> {
    return await this.send<T>(path, HTTPMethod.POST, data, header);
  }

  public async patch<T = Answer>(path: string, data?: any, header?: HttpHeaders): Promise<T> {
    return await this.send<T>(path, HTTPMethod.PATCH, data, header);
  }

  public async put<T = Answer>(path: string, data?: any, header?: HttpHeaders): Promise<T> {
    return await this.send<T>(path, HTTPMethod.PUT, data, header);
  }

  public async delete<T = Answer>(path: string, data?: any, header?: HttpHeaders): Promise<T> {
    return await this.send<T>(path, HTTPMethod.DELETE, data, header);
  }

  private getServerURL(): string {
    const protocol = window.location.protocol;
    const location = window.location.hostname;
    const port = window.location.port;
    return `${protocol}//${location}:${port === '4200' ? '8010' : port}`;
    // (protocol === 'https:' ? 'wss' : 'ws') + '://' + location + ':' + (port === '4200' ? '8000' : port);
  }
}
