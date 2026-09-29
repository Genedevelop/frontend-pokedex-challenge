import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { Card } from './card';

export const DEFAULT_LIMIT = 20;

interface CardsResponse {
  cards: Card[];
}

@Injectable({ providedIn: 'root' })
export class CardApi {
  private readonly http = inject(HttpClient);

  /**
   * One search box covers both name and type. The API ANDs the two filters, so each is
   * queried on its own and the results are merged, name matches first.
   */
  search(query: string, limit = DEFAULT_LIMIT): Observable<Card[]> {
    const term = query.trim();
    if (!term) {
      return this.fetch({ limit });
    }
    return forkJoin([this.fetch({ limit, name: term }), this.fetch({ limit, type: term })]).pipe(
      map(([byName, byType]) => uniqueById([...byName, ...byType])),
    );
  }

  private fetch(query: { limit: number; name?: string; type?: string }): Observable<Card[]> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<CardsResponse>('/api/cards', { params }).pipe(map((res) => res.cards));
  }
}

function uniqueById(cards: Card[]): Card[] {
  const seen = new Set<string>();
  return cards.filter((card) => !seen.has(card.id) && seen.add(card.id));
}
