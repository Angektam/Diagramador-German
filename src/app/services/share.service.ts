import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShareService {
  /** Encode prompt content into a URL-safe base64 string */
  async create(content: string): Promise<string> {
    return btoa(encodeURIComponent(content));
  }

  /** Decode a base64 string back to prompt content */
  async get(id: string): Promise<string> {
    return decodeURIComponent(atob(id));
  }
}
