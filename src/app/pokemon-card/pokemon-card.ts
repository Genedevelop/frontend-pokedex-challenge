import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Card } from '../pokemon/card';
import { cardStats } from '../pokemon/card-stats';

export type CardAction = 'add' | 'remove';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonCard {
  readonly card = input.required<Card>();
  readonly action = input.required<CardAction>();
  readonly acted = output<Card>();

  protected readonly stats = computed(() => cardStats(this.card()));
  protected readonly levels = computed(() => {
    const { hp, strength, weakness } = this.stats();
    return [
      { label: 'HP', value: hp },
      { label: 'STR', value: strength },
      { label: 'WEAK', value: weakness },
    ];
  });
  protected readonly faces = computed(() => Array.from({ length: this.stats().happiness }));
}
