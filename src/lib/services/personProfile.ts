/**
 * Person Profile service (mock-backed, demo only).
 * Future endpoint: GET /api/v1/persons/{person_id}/profile
 */
import { DEMO_PERSON_IDS, MOCK_PERSON_PROFILES, type PersonProfile } from "@/data/personProfile.mock";

export type * from "@/data/personProfile.mock";

export class PersonNotFoundError extends Error {
  constructor(id: string) { super(`Person not found: ${id}`); this.name = "PersonNotFoundError"; }
}

export const personProfileService = {
  async getPersonProfile(personId: string): Promise<PersonProfile> {
    await new Promise((r) => setTimeout(r, 200));
    const p = MOCK_PERSON_PROFILES[personId];
    if (!p) throw new PersonNotFoundError(personId);
    return p;
  },
  /** Lightweight list of demo people pinned at the top of Community → People */
  getDemoPeople() {
    return DEMO_PERSON_IDS.map((id) => MOCK_PERSON_PROFILES[id]);
  },
};
