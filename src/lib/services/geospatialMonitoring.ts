import { MONITORING_DEMO_END, MONITORING_EVENTS } from "@/data/geospatialMonitoring.mock";
import { MOCK_PROVINCES } from "@/data/situationRoom.mock";
export { eventSummary, filterEvents, timelineBuckets, resolutionFor, rangeHours, monitoringDefaults, HOUR } from "@/lib/monitoring";
export type { MonitoringEvent, MonitoringFilters, MonitoringRange } from "@/lib/monitoring";

export const geospatialMonitoringService = {
  /** Future GET /monitoring/events — replace only this method with authenticated FastAPI reads. */
  async getEvents() {
    return { events: MONITORING_EVENTS, asOf: MONITORING_DEMO_END, provinces: MOCK_PROVINCES };
  },
  /** Existing local geography, no new asset or map dependency. */
  async getGeometry(): Promise<{ features: { id: string; geometry: { coordinates: number[][][][] } }[] }> {
    const response = await fetch("/iran-provinces.geo.json");
    if (!response.ok) throw new Error("دریافت نقشه ناموفق بود");
    return response.json();
  },
};