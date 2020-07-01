import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http.service';
import { Motion } from './model/motion';
import { AuthService } from 'src/app/core/services/auth.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MotionService {
  private readonly motionEndpoint = 'api/motions';

  constructor(private http: HttpService, private auth: AuthService) {}

  public async create(title: string, description?: string): Promise<void> {
    return this.http.post(
      `${this.motionEndpoint}/create`,
      { motion_title: title, motion_description: description },
      new HttpHeaders().set('authentication', this.auth.accessToken)
    );
  }

  public async update(id: string, title?: string, description?: string): Promise<void> {
    if (!(title || description)) {
      return;
    }
    return this.http.put(
      `${this.motionEndpoint}/update`,
      {
        title,
        description,
        id
      },
      new HttpHeaders().set('authentication', this.auth.accessToken)
    );
  }

  public async get(id: string): Promise<Motion> {
    return (
      await this.http.post<{ success: boolean; motion: Motion }>(
        `${this.motionEndpoint}/get`,
        { id },
        new HttpHeaders().set('authentication', this.auth.accessToken)
      )
    ).motion;
  }

  public async getAll(): Promise<Motion[]> {
    const token = this.auth.accessToken;
    console.log('token', token);
    const answer = (await this.http.get(
      `${this.motionEndpoint}/all`,
      null,
      new HttpHeaders().set('authentication', token)
    )) as { success: boolean; motions: Motion[] };
    return answer.motions;
  }
}
