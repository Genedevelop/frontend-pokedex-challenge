import { TestBed } from '@angular/core/testing';

import { Card } from '../pokemon/card';
import { PokedexStore } from './pokedex-store';

const card = (id: string): Card => ({ id, name: id, imageUrl: '' });

describe('PokedexStore', () => {
  beforeEach(() => localStorage.clear());

  const create = () => TestBed.inject(PokedexStore);

  it('adds a card once', () => {
    const store = create();
    store.add(card('a'));
    store.add(card('a'));
    expect(store.cards().map((c) => c.id)).toEqual(['a']);
    expect(store.has('a')).toBe(true);
  });

  it('removes a card', () => {
    const store = create();
    store.add(card('a'));
    store.add(card('b'));
    store.remove('a');
    expect(store.cards().map((c) => c.id)).toEqual(['b']);
    expect(store.has('a')).toBe(false);
  });

  it('persists to localStorage and restores on start', () => {
    const store = create();
    store.add(card('a'));
    TestBed.tick();

    TestBed.resetTestingModule();
    expect(
      create()
        .cards()
        .map((c) => c.id),
    ).toEqual(['a']);
  });

  it('starts empty when storage holds garbage', () => {
    localStorage.setItem('frontend-pokedex-challenge.cards', '{not json');
    expect(create().cards()).toEqual([]);
  });
});
