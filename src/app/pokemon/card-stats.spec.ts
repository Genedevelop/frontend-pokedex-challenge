import { Card } from './card';
import {
  cardStats,
  happiness,
  hpLevel,
  parseLeadingInt,
  strengthLevel,
  totalDamage,
  weaknessLevel,
} from './card-stats';

const card = (overrides: Partial<Card> = {}): Card => ({
  id: 'x-1',
  name: 'Test',
  imageUrl: '',
  ...overrides,
});

const attacks = (...damages: string[]) =>
  damages.map((damage, i) => ({ name: `attack ${i}`, damage }));
const weaknesses = (n: number) => Array.from({ length: n }, () => ({ type: 'Fire', value: '×2' }));

describe('parseLeadingInt', () => {
  it.each([
    ['50', 50],
    ['50+', 50],
    ['20×', 20],
    ['40x', 40],
    ['80＋', 80],
    ['', 0],
    ['None', 0],
    [undefined, 0],
    [null, 0],
  ])('%j -> %d', (input, expected) => {
    expect(parseLeadingInt(input)).toBe(expected);
  });
});

describe('hpLevel', () => {
  it('keeps values up to 100', () => expect(hpLevel(card({ hp: '60' }))).toBe(60));
  it('caps values above 100', () => expect(hpLevel(card({ hp: '110' }))).toBe(100));
  it('is 0 when hp is missing or not a number', () => {
    expect(hpLevel(card())).toBe(0);
    expect(hpLevel(card({ hp: 'None' }))).toBe(0);
  });
});

describe('strengthLevel', () => {
  it('is 50 per attack, capped at 100', () => {
    expect(strengthLevel(card({ attacks: attacks('10') }))).toBe(50);
    expect(strengthLevel(card({ attacks: attacks('10', '20') }))).toBe(100);
    expect(strengthLevel(card({ attacks: attacks('10', '20', '30') }))).toBe(100);
  });
  it('is 0 without attacks', () => expect(strengthLevel(card())).toBe(0));
});

describe('weaknessLevel', () => {
  it('is 100 per weakness, capped at 100', () => {
    expect(weaknessLevel(card({ weaknesses: weaknesses(1) }))).toBe(100);
    expect(weaknessLevel(card({ weaknesses: weaknesses(2) }))).toBe(100);
  });
  it('is 0 without weaknesses', () => expect(weaknessLevel(card())).toBe(0));
});

describe('totalDamage', () => {
  it('sums every attack without symbols', () => {
    expect(totalDamage(card({ attacks: attacks('50+', '40x') }))).toBe(90);
  });
  it('treats empty damage as 0', () => {
    expect(totalDamage(card({ attacks: attacks('', '30') }))).toBe(30);
  });
});

describe('happiness', () => {
  // Face counts read off the interactive mockup (screenshot/exam-crop.gif).
  it.each([
    ['Deoxys ex', '110', ['50+'], 5],
    ['Cubone', '60', ['10', '20×'], 4],
    ['Charmander', '50', ['10', '30'], 4],
    ['Infernape', '100', ['40', '80'], 6],
    ['Greninja', '140', ['40', '80'], 6],
  ])('%s shows %#', (_name, hp, damages, faces) => {
    expect(happiness(card({ hp, attacks: attacks(...damages), weaknesses: weaknesses(1) }))).toBe(
      faces,
    );
  });

  it('never goes below 0', () => {
    expect(happiness(card({ hp: '0', weaknesses: weaknesses(1) }))).toBeGreaterThanOrEqual(0);
  });

  it('gives a card with no stats 2 icons', () => {
    expect(happiness(card())).toBe(2);
  });
});

describe('cardStats', () => {
  it('matches the README example apart from the rounded happiness', () => {
    const deoxys = card({ hp: '110', attacks: attacks('50+', '40x'), weaknesses: weaknesses(1) });
    expect(cardStats(deoxys)).toEqual({
      hp: 100,
      strength: 100,
      weakness: 100,
      damage: 90,
      happiness: 6,
    });
  });
});
