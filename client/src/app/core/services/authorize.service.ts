import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeService {
  constructor(private http: HttpService) {}

  public makeAnswer(): void {
    window.location.href = `${this.http.getServerURL()}/approve`;
  }
}
