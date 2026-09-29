import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Card } from './card';
import { CardApi } from './card-api';

const card = (id: string): Card => ({ id, name: id, imageUrl: '' });

describe('CardApi', () => {
  let api: CardApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(CardApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the default page when the query is blank', async () => {
    const result = firstValueFrom(api.search('   '));
    const req = http.expectOne((r) => r.url === '/api/cards');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.has('name')).toBe(false);
    req.flush({ cards: [card('a')] });
    expect(await result).toEqual([card('a')]);
  });

  it('searches name and type separately and merges without duplicates', async () => {
    const result = firstValueFrom(api.search(' fire '));
    http.expectOne((r) => r.params.get('name') === 'fire').flush({ cards: [card('a'), card('b')] });
    http.expectOne((r) => r.params.get('type') === 'fire').flush({ cards: [card('b'), card('c')] });
    expect((await result).map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });
});
