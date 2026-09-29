export interface Attack {
  name: string;
  damage?: string;
  text?: string;
  cost?: string[];
  convertedEnergyCost?: number;
}

export interface Weakness {
  type: string;
  value: string;
}

/** A card as returned by `GET /api/cards`; only the fields the app reads are typed. */
export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  imageUrlHiRes?: string;
  supertype?: string;
  type?: string;
  hp?: string;
  attacks?: Attack[];
  weaknesses?: Weakness[];
}
