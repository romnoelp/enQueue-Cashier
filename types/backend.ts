export type Station = {
  id?: string;
  name?: string;
  description?: string;
  type?: unknown;
};

export type Counter = {
  id?: string;
  stationId?: string;
  cashierUid?: string;
  number?: number;
};

export type StationsResponse = { stations: Station[]; nextCursor: string | null };
export type CountersResponse = { counters: Counter[]; nextCursor: string | null };

export type FirebaseCustomTokenResponse = { customToken: string };
