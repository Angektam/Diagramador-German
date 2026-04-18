import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShareService {
  constructor(private http: HttpClient) {}

  async create(content: string): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<{ id: string }>('/api/share', { content })
    );
    return response.id;
  }

  async get(id: string): Promise<string> {
    const response = await firstValueFrom(
      this.http.get<{ id: string; content: string }>(`/api/share/${encodeURIComponent(id)}`)
    );
    return response.content;
  }
}
