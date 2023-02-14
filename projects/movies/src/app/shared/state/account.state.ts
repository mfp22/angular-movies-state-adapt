import { Injectable } from '@angular/core';
import { filter, map, Observable, switchMap } from 'rxjs';
import { TMDBAccountList } from '../../data-access/api/model/list.model';
import { AuthState } from '../auth/auth.state';
import { AccountResource } from '../../data-access/api/resources/account.resource';
import { adapt } from '@state-adapt/angular';
import { toSource } from '@state-adapt/rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountState {
  readonly accountLists$ = adapt(
    ['userLists', [] as TMDBAccountList[]],
    (this.auth.accountId$ as Observable<string>).pipe(
      filter((v) => v !== null),
      switchMap((id) =>
        this.authResource.getAccountList(id).pipe(map(({ results }) => results))
      ),
      toSource('accountLists$')
    )
  ).state$;

  constructor(private auth: AuthState, private authResource: AccountResource) {}
}
