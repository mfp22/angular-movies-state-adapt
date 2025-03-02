import { RxState } from '@rx-angular/state';
import { patch, toDictionary } from '@rx-angular/cdk/transformations';
import { Injectable } from '@angular/core';
import { filter, map } from 'rxjs';
import { optimizedFetch } from '../utils/optimized-fetch';
import { AppInitializer } from '../rxa-custom/app-initializer';
import { RxActionFactory } from '@rx-angular/state/actions';
import { withLoadingEmission } from '../cdk/loading/withLoadingEmissions';
import {
  CategoryResponse,
  MovieResource,
  MovieResponse,
} from '../../data-access/api/resources/movie.resource';
import { WithContext } from '../cdk/context/context.interface';
import { pluck } from '../rxa-custom/get';

export interface MovieModel {
  movies: WithContext<Record<string, MovieResponse>>;
  categoryMovies: WithContext<Record<string, CategoryResponse>>;
}

interface Actions {
  fetchMovie: string;
  fetchCategoryMovies: string;
}

@Injectable({
  providedIn: 'root',
})
export class MovieState extends RxState<MovieModel> implements AppInitializer {
  private actions = this.actionsF.create();

  fetchMovie = this.actions.fetchMovie;
  fetchCategoryMovies = this.actions.fetchCategoryMovies;

  categoryMoviesByIdCtx = (id: string) =>
    this.select(
      filter(({ categoryMovies }) => !!categoryMovies),
      map(({ categoryMovies: { value, loading } }) => ({
        loading,
        value: pluck(value, id),
      }))
    );

  movieByIdCtx = (id: string) =>
    this.select(
      map(({ movies: { value, loading } }) => ({
        loading,
        value: pluck(value, id),
      }))
    );

  constructor(
    private actionsF: RxActionFactory<Actions>,
    private movieResource: MovieResource
  ) {
    super();

    this.connect(
      'movies',
      this.actions.fetchMovie$.pipe(
        optimizedFetch(
          (id) => id,
          (id) => {
            return this.movieResource.getMovie(id).pipe(
              map((result) => ({ value: toDictionary([result], 'id') })),
              withLoadingEmission()
            );
          }
        )
      ),
      (oldState, newPartial) => {
        let resultState = patch(oldState?.movies || {}, newPartial);
        resultState.value = patch(
          oldState?.movies?.value || {},
          resultState?.value || {}
        );
        return resultState;
      }
    );

    this.connect(
      'categoryMovies',
      this.actions.fetchCategoryMovies$.pipe(
        map((category) => ({
          category,
        })),
        optimizedFetch(
          ({ category }) => category,
          ({ category }) =>
            this.movieResource.getMovieCategory(category).pipe(
              map((paginatedResult) => ({
                value: { [category]: paginatedResult },
              })),
              withLoadingEmission()
            )
        )
      ),
      (oldState, newPartial) => {
        let resultState = patch(oldState?.categoryMovies, newPartial);
        resultState.value = patch(
          oldState?.categoryMovies?.value,
          resultState?.value
        );
        return resultState;
      }
    );
  }

  // prefetch categories / movie
  initialize(options: { category: string } | { movieId: string }): void {
    if ('category' in options && options.category) {
      this.fetchCategoryMovies(options.category);
    }
    if ('movieId' in options && options.movieId) {
      this.fetchMovie(options.movieId);
    }
  }
}
