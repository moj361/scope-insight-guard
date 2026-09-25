/**
 * Situation Room service layer.
 * Currently backed by mocks; each method maps 1:1 to a future FastAPI endpoint
 * (see comments). Swap the body for `authFetch(apiUrl(...))` when ready.
 */
import {
  MOCK_CASE_CONNECTIONS,
  MOCK_CATEGORIES,
  MOCK_CITIES,
  MOCK_COUNTRIES_WITH_TAXONOMY,
  MOCK_PROVINCES,
  type CaseConnection,
  type Category,
  type City,
  type Country,
  type Province,
  type Subcategory,
} from "@/data/situationRoom.mock";

export type { CaseConnection, Category, City, Country, Province, Subcategory };

export interface SituationContext {
  countryId: string | null;
  provinceId: string | null;
  cityId: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
}

export const emptyContext: SituationContext = {
  countryId: null,
  provinceId: null,
  cityId: null,
  categoryId: null,
  subcategoryId: null,
};

let countriesCache: Country[] | null = null;

export const situationRoomService = {
  /** GET /situation-room/countries */
  async getCountries(): Promise<Country[]> {
    if (countriesCache) return countriesCache;
    const res = await fetch("/world.geo.json");
    const geo = (await res.json()) as { features: { id: string; properties: { name: string } }[] };
    countriesCache = geo.features
      .map((f) => ({
        id: f.id,
        name: f.properties.name,
        nameFa: MOCK_COUNTRIES_WITH_TAXONOMY[f.id]?.nameFa,
        hasTaxonomy: Boolean(MOCK_COUNTRIES_WITH_TAXONOMY[f.id]),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return countriesCache;
  },

  /** GET /situation-room/provinces?country_id= */
  async getProvinces(countryId: string): Promise<Province[]> {
    return MOCK_PROVINCES.filter((p) => p.countryId === countryId);
  },

  /** GET /situation-room/cities?province_id= */
  async getCities(provinceId: string): Promise<City[]> {
    return MOCK_CITIES.filter((c) => c.provinceId === provinceId);
  },

  /** GET /situation-room/categories?country_id=&province_id= */
  async getCategories(context: SituationContext): Promise<Category[]> {
    return MOCK_CATEGORIES.filter((c) => c.countryId === context.countryId);
  },

  /** GET /situation-room/subcategories?category_id= */
  async getSubcategories(categoryId: string, _context: SituationContext): Promise<Subcategory[]> {
    return MOCK_CATEGORIES.find((c) => c.id === categoryId)?.subcategories ?? [];
  },

  /** GET /situation-room/cases?subcategory_id= */
  async getCaseForSubcategory(
    subcategoryId: string,
    context: SituationContext,
  ): Promise<CaseConnection | null> {
    return (
      MOCK_CASE_CONNECTIONS.find(
        (c) => c.subcategoryId === subcategoryId && c.countryId === context.countryId,
      ) ?? null
    );
  },

  /** Sync helper for badges (same data as getCaseForSubcategory) */
  isConnected(subcategoryId: string): boolean {
    return MOCK_CASE_CONNECTIONS.some((c) => c.subcategoryId === subcategoryId);
  },

  /** GET /situation-room/cases?country_id= */
  async getCasesForCountry(countryId: string): Promise<CaseConnection[]> {
    return MOCK_CASE_CONNECTIONS.filter((c) => c.countryId === countryId);
  },
};
