import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card } from '../pokemon/card';
import { CardAction, PokemonCard } from './pokemon-card';

const cubone: Card = {
  id: 'dp1-1',
  name: 'Cubone',
  imageUrl: 'https://images.example/cubone.png',
  hp: '60',
  attacks: [
    { name: 'Headbutt', damage: '10' },
    { name: 'Bonemerang', damage: '20×' },
  ],
  weaknesses: [{ type: 'Grass', value: '×2' }],
};

describe('PokemonCard', () => {
  let fixture: ComponentFixture<PokemonCard>;
  let el: HTMLElement;

  const render = async (card: Card, action: CardAction) => {
    fixture.componentRef.setInput('card', card);
    fixture.componentRef.setInput('action', action);
    await fixture.whenStable();
  };
  const meters = () =>
    [...el.querySelectorAll('[role=meter]')].map((m) => [
      m.getAttribute('aria-label'),
      m.getAttribute('aria-valuenow'),
    ]);
  const faces = () => el.querySelectorAll('.happiness img').length;
  const actionButton = () => el.querySelector<HTMLButtonElement>('.action')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PokemonCard] }).compileComponents();
    fixture = TestBed.createComponent(PokemonCard);
    el = fixture.nativeElement;
  });

  it('shows the name and card art', async () => {
    await render(cubone, 'add');
    expect(el.querySelector('.name')?.textContent?.trim()).toBe('Cubone');
    const art = el.querySelector<HTMLImageElement>('.art')!;
    expect(art.src).toBe(cubone.imageUrl);
    expect(art.alt).toBe('Cubone');
  });

  it('renders HP, STR and WEAK levels as meters and fills each tube to its level', async () => {
    await render(cubone, 'add');
    expect(meters()).toEqual([
      ['HP', '60'],
      ['STR', '100'],
      ['WEAK', '100'],
    ]);
    const widths = [...el.querySelectorAll<HTMLElement>('.tube .value')].map((v) => v.style.width);
    expect(widths).toEqual(['60%', '100%', '100%']);
  });

  it('shows one happiness icon per point', async () => {
    // (60/10 + 30/10 + 10 - 1) / 5 = 3.6 -> 4
    await render(cubone, 'add');
    expect(faces()).toBe(4);
    expect(el.querySelector('.happiness')?.getAttribute('aria-label')).toBe('Happiness 4');
  });

  it('shows empty tubes for a card without stats', async () => {
    await render({ id: 'trainer', name: 'Potion', imageUrl: '' }, 'add');
    expect(meters().map(([, value]) => value)).toEqual(['0', '0', '0']);
    expect(faces()).toBe(2);
  });

  it('labels the action "Add" in search mode', async () => {
    await render(cubone, 'add');
    expect(actionButton().textContent?.trim()).toBe('Add');
  });

  it('shows X with an accessible remove label in Pokédex mode', async () => {
    await render(cubone, 'remove');
    expect(actionButton().querySelector('[aria-hidden=true]')?.textContent).toBe('X');
    expect(actionButton().querySelector('.sr-only')?.textContent?.trim()).toBe('Remove Cubone');
  });

  it('emits the card when the action is clicked', async () => {
    await render(cubone, 'remove');
    const emitted: Card[] = [];
    fixture.componentInstance.acted.subscribe((card) => emitted.push(card));
    actionButton().click();
    expect(emitted).toEqual([cubone]);
  });

  it('updates when the card input changes', async () => {
    await render(cubone, 'add');
    await render({ ...cubone, id: 'other', name: 'Marowak', hp: '90', attacks: [] }, 'add');
    expect(el.querySelector('.name')?.textContent?.trim()).toBe('Marowak');
    expect(meters()).toEqual([
      ['HP', '90'],
      ['STR', '0'],
      ['WEAK', '100'],
    ]);
  });
});
