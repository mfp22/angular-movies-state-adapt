import { CommonModule, DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  TrackByFunction,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  Subject,
  switchMap,
} from 'rxjs';
import { TMDBMovieGenreModel } from '../data-access/api/model/movie-genre.model';
import { fallbackRouteToDefault } from '../shared/router/routing-default.util';
import { trackByProp } from '../shared/utils/track-by';
import { RouterState } from '../shared/router/router.state';
import { getIdentifierOfTypeAndLayoutUtil } from '../shared/router/get-identifier-of-type-and-layout.util';
import { GenreResource } from '../data-access/api/resources/genre.resource';
import { HamburgerButtonComponent } from '../ui/component/hamburger-button/hamburger-button.component';
import { LetModule } from '@rx-angular/template/let';
import { SideDrawerComponent } from '../ui/component/side-drawer/side-drawer.component';
import { SearchBarComponent } from '../ui/component/search-bar/search-bar.component';
import { DarkModeToggleComponent } from '../ui/component/dark-mode-toggle/dark-mode-toggle.component';
import { ForModule } from '@rx-angular/template/for';
import { LazyDirective } from '../shared/cdk/lazy/lazy.directive';
import { FastSvgModule } from '@push-based/ngx-fast-svg';
import { adapt } from '@state-adapt/angular';
import { toSource } from '@state-adapt/rxjs';
import { booleanAdapter } from '@state-adapt/core/adapters';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LetModule,
    ForModule,
    FastSvgModule,
    HamburgerButtonComponent,
    SideDrawerComponent,
    SearchBarComponent,
    DarkModeToggleComponent,
    LazyDirective,
  ],
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class AppShellComponent {
  urlChange$ = this.router.events.pipe(
    filter((e) => e instanceof NavigationEnd),
    map((e) => (e as NavigationEnd).urlAfterRedirects),
    distinctUntilChanged(),
    toSource('urlChange$')
  );

  sideDrawerOpen = adapt(['app-shell.sideDrawerOpen', false, booleanAdapter], {
    setFalse: this.urlChange$,
  });

  search$ = this.routerState.select(
    getIdentifierOfTypeAndLayoutUtil('search', 'list')
  );

  loadAccountMenu$ = new Subject<void>();

  accountMenuComponent$ = this.loadAccountMenu$.pipe(
    switchMap(() =>
      import('./account-menu/account-menu.component.lazy').then(({ c }) => c)
    ),
    shareReplay(1)
  );

  constructor(
    public routerState: RouterState,
    public genreResource: GenreResource,
    @Inject(DOCUMENT) document: Document,
    private router: Router
  ) {
    /**
     * **🚀 Perf Tip for TBT:**
     *
     * Disable initial sync navigation in router config and schedule it in router-outlet container component.
     * We use a scheduling API (setTimeout) to run it in a separate task from the bootstrap phase
     */
    setTimeout(() => {
      this.router.navigate([
        // The pathname route seems to work correctly on SSR but when pre-rendering it is an empty string.
        // We have to fall back to document URL as a fix.
        fallbackRouteToDefault(document.location.pathname || document.URL),
      ]);
    });
  }

  readonly genres$ = this.genreResource.getGenresCached();

  readonly trackByGenre: TrackByFunction<TMDBMovieGenreModel> =
    trackByProp<TMDBMovieGenreModel>('name');

  searchMovie(term: string) {
    term === ''
      ? this.router.navigate(['list/category/popular'])
      : this.router.navigate([`list/search/${term}`]);
  }
}
