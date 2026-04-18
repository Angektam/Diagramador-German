import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private title = inject(Title);
  private readonly base = 'PromptGen';

  set(page: string) { this.title.setTitle(`${page} · ${this.base}`); }
  reset()           { this.title.setTitle(this.base); }
}
