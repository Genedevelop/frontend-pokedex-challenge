import { Injectable, computed, effect, signal } from '@angular/core';

import { Card } from '../pokemon/card';

const STORAGE_KEY = 'frontend-pokedex-challenge.cards';

/** The user's Pokédex, kept in localStorage so it survives a reload. */
@Injectable({ providedIn: 'root' })
export class PokedexStore {
  private readonly state = signal<Card[]>(load());

  readonly cards = this.state.asReadonly();
  private readonly ids = computed(() => new Set(this.state().map((card) => card.id)));

  constructor() {
    effect(() => save(this.state()));
  }

  has(id: string): boolean {
    return this.ids().has(id);
  }

  add(card: Card): void {
    if (!this.has(card.id)) {
      this.state.update((cards) => [...cards, card]);
    }
  }

  remove(id: string): void {
    this.state.update((cards) => cards.filter((card) => card.id !== id));
  }
}

function load(): Card[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(cards: Card[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // Storage can be full or blocked; the in-memory list still works.
  }
}
