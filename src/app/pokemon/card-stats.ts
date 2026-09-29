import { Card } from './card';

export interface CardStats {
  /** 0–100 */
  hp: number;
  /** Percentage, 0–100 */
  strength: number;
  /** Percentage, 0–100 */
  weakness: number;
  /** Sum of every attack's base damage */
  damage: number;
  /** Number of happiness icons, never negative */
  happiness: number;
}

const MAX_LEVEL = 100;

/** Reads the leading integer of a value such as "50+", "20×" or "110"; anything else is 0. */
export function parseLeadingInt(value: string | undefined | null): number {
  const match = /^\s*(\d+)/.exec(value ?? '');
  return match ? Number(match[1]) : 0;
}

export function hpLevel(card: Card): number {
  return Math.min(parseLeadingInt(card.hp), MAX_LEVEL);
}

export function strengthLevel(card: Card): number {
  return Math.min((card.attacks?.length ?? 0) * 50, MAX_LEVEL);
}

export function weaknessLevel(card: Card): number {
  return Math.min((card.weaknesses?.length ?? 0) * 100, MAX_LEVEL);
}

export function totalDamage(card: Card): number {
  return (card.attacks ?? []).reduce((sum, attack) => sum + parseLeadingInt(attack.damage), 0);
}

/**
 * ((HP / 10) + (Damage / 10) + 10 - Weakness) / 5, rounded to whole icons.
 * HP is the capped level and Weakness counts weaknesses (level / 100) — the combination the
 * interactive mockup renders for every visible card.
 */
export function happiness(card: Card): number {
  const weaknessCount = weaknessLevel(card) / 100;
  const raw = (hpLevel(card) / 10 + totalDamage(card) / 10 + 10 - weaknessCount) / 5;
  return Math.max(0, Math.round(raw));
}

export function cardStats(card: Card): CardStats {
  return {
    hp: hpLevel(card),
    strength: strengthLevel(card),
    weakness: weaknessLevel(card),
    damage: totalDamage(card),
    happiness: happiness(card),
  };
}
