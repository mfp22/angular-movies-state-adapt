import { LetModule } from '@rx-angular/template/let';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthEffects } from '../../shared/auth/auth.effects';
import { AuthState } from '../../shared/auth/auth.state';
import { map } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IfModule } from '../../shared/rxa-custom/if/src';
import { adapt } from '@state-adapt/angular';
import { booleanAdapter } from '@state-adapt/core/adapters';
import { toSource } from '@state-adapt/rxjs';
export const imports = [RouterModule, CommonModule, LetModule, IfModule];

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, LetModule, IfModule],
  selector: 'account-menu',
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMenuComponent {
  accountIdTruthy$ = this.authState.accountId$.pipe(
    map((s) => s !== null),
    toSource('accountIdTruthy$')
  );

  loggedIn = adapt(['loggedIn', false, booleanAdapter], this.accountIdTruthy$);

  signOut = this.authEffects.signOut;
  signIn = this.authEffects.approveRequestToken;

  constructor(private authEffects: AuthEffects, private authState: AuthState) {}
}
