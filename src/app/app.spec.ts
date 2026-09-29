import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { App } from './app';
import { Card } from './pokemon/card';

const card = (id: string, name = id): Card => ({
  id,
  name,
  imageUrl: '',
  hp: '60',
  attacks: [{ name: 'Bone', damage: '10' }],
  weaknesses: [{ type: 'Grass', value: '×2' }],
});

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;
  let el: HTMLElement;

  const names = (selector: string) =>
    [...el.querySelectorAll(`${selector} .name`)].map((n) => n.textContent?.trim());
  const stable = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const openSearch = async (cards: Card[]) => {
    // The first page loads right away; only later keystrokes are debounced.
    el.querySelector<HTMLButtonElement>('.add')!.click();
    TestBed.tick();
    http.expectOne((r) => r.url === '/api/cards').flush({ cards });
    await stable();
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(App);
    el = fixture.nativeElement;
    await stable();
  });

  it('starts with an empty Pokédex', () => {
    expect(el.querySelector('h1')?.textContent).toContain('My Pokédex');
    expect(names('.pokedex')).toEqual([]);
  });

  it('adds a card from search, hides it from results, and removes it again', async () => {
    await openSearch([card('a', 'Cubone'), card('b', 'Pikachu')]);
    expect(names('app-search-modal')).toEqual(['Cubone', 'Pikachu']);

    el.querySelector<HTMLButtonElement>('app-search-modal .action')!.click();
    await stable();
    expect(names('app-search-modal')).toEqual(['Pikachu']);
    expect(names('.pokedex')).toEqual(['Cubone']);

    el.querySelector<HTMLElement>('[data-testid=backdrop]')!.click();
    await stable();
    expect(el.querySelector('app-search-modal')).toBeNull();

    el.querySelector<HTMLButtonElement>('.pokedex .action')!.click();
    await stable();
    expect(names('.pokedex')).toEqual([]);
  });

  it('keeps the modal open when clicking inside it', async () => {
    await openSearch([card('a')]);
    el.querySelector<HTMLElement>('app-search-modal .content')!.click();
    await stable();
    expect(el.querySelector('app-search-modal')).not.toBeNull();
  });

  it('renders the stat levels and happiness of a card', async () => {
    await openSearch([card('a', 'Cubone')]);
    const meters = [...el.querySelectorAll('app-search-modal [role=meter]')];
    expect(meters.map((m) => m.getAttribute('aria-valuenow'))).toEqual(['60', '50', '100']);
    // (60/10 + 10/10 + 10 - 1) / 5 = 3.2 -> 3 faces
    expect(el.querySelectorAll('app-search-modal .happiness img').length).toBe(3);
  });
});
