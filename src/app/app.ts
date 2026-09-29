import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { PokedexStore } from './pokedex/pokedex-store';
import { PokemonCard } from './pokemon-card/pokemon-card';
import { SearchModal } from './search-modal/search-modal';

@Component({
  selector: 'app-root',
  imports: [PokemonCard, SearchModal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(PokedexStore);
  protected readonly searchOpen = signal(false);
}
