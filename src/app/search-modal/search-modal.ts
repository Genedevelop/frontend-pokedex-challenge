import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PokedexStore } from '../pokedex/pokedex-store';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { Card } from '../pokemon/card';
import { CardApi, DEFAULT_LIMIT } from '../pokemon/card-api';

export const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-search-modal',
  imports: [PokemonCard],
  templateUrl: './search-modal.html',
  styleUrl: './search-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class SearchModal {
  private readonly api = inject(CardApi);
  private readonly store = inject(PokedexStore);

  readonly closed = output<void>();

  protected readonly query = signal('');
  private readonly debouncedQuery = toSignal(
    toObservable(this.query).pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged()),
    { initialValue: '' },
  );

  protected readonly results = rxResource({
    // Ask for enough cards that a full page is left after hiding the ones already picked.
    params: () => ({
      query: this.debouncedQuery(),
      limit: DEFAULT_LIMIT + untracked(() => this.store.cards().length),
    }),
    stream: ({ params }) => this.api.search(params.query, params.limit),
  });

  protected readonly unselected = computed(() =>
    (this.results.value() ?? []).filter((card) => !this.store.has(card.id)),
  );

  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    afterNextRender(() => this.searchInput().nativeElement.focus());
  }

  protected add(card: Card): void {
    this.store.add(card);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
