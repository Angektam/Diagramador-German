import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from './components/notification-container/notification-container.component';
import { ThemeService } from './services/theme.service';
import { SessionActivityService } from './services/session-activity.service';
import { KeyboardShortcutsService } from './services/keyboard-shortcuts.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationContainerComponent],
  template: `
    <router-outlet />
    <app-notification-container />
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private theme = inject(ThemeService);
  private sessionActivity = inject(SessionActivityService);
  private shortcuts = inject(KeyboardShortcutsService);

  ngOnInit() {
    this.theme.init();
    this.sessionActivity.init();
    this.shortcuts.init();
  }
}
