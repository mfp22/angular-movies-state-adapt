import { CommonModule, DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { LetModule } from '@rx-angular/template/let';
import { adapt } from '@state-adapt/angular';
import { booleanAdapter } from '@state-adapt/core/adapters';
import { tap } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, LetModule],
  selector: 'ui-dark-mode-toggle',
  template: `
    <div class="dark-mode-toggle">
      <ng-container *ngIf="applyThemeToDocument$ | async">asdf</ng-container>

      <button
        aria-label="Enable dark mode"
        type="button"
        class="light"
        (click)="isLightTheme.setTrue()"
      >
        ☀
      </button>

      <span class="toggle">
        <input
          *rxLet="isLightTheme.state$; let checked; strategy: 'immediate'"
          class="toggle-track"
          type="checkbox"
          id="dark-mode"
          [checked]="checked"
          (change)="isLightTheme.toggle()"
        />
        <label style="color: transparent" for="dark-mode">
          Toggle Switch
        </label>
      </span>

      <button
        aria-label="Disable dark mode"
        type="button"
        class="dark"
        (click)="isLightTheme.setFalse()"
      >
        ☾
      </button>
    </div>
  `,
  styleUrls: ['dark-mode-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class DarkModeToggleComponent {
  isLightTheme = adapt(['isLightTheme', false], booleanAdapter);

  applyThemeToDocument$ = this.isLightTheme.state$.pipe(
    tap((isLightTheme) => this.toggleTheme(isLightTheme))
  );

  document = inject(DOCUMENT);

  toggleTheme = (isLightTheme: boolean): void => {
    if (isLightTheme) {
      this.document.body.classList.remove('dark');
      this.document.body.classList.add('light');
    } else {
      this.document.body.classList.add('dark');
      this.document.body.classList.remove('light');
    }
  };
}
