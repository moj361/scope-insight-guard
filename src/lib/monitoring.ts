export type MonitoringRange = "1h" | "6h" | "24h" | "3d" | "7d" | "custom";
export interface MonitoringEvent {
  event_id: string;
  event_type: string;
  provinceId: string;
  province: string;
  city: string;
  lat: number;
  lng: number;
  time: string;
  community: string;
  subject: string;
  message_count: number;
  source_count: number;
  severity: "high" | "medium" | "low";
  intensity: number;
}
export interface MonitoringFilters {
  province: string; city: string; eventType: string; community: string; subject: string; severity: string;
}
export const monitoringDefaults: MonitoringFilters = {
  province: "all", city: "all", eventType: "all", community: "all", subject: "all", severity: "all",
};
export const HOUR = 3_600_000;
export const rangeHours = { "1h": 1, "6h": 6, "24h": 24, "3d": 72, "7d": 168 };
export function resolutionFor(duration: number): number {
  if (duration <= HOUR) return HOUR / 12;
  if (duration <= 6 * HOUR) return HOUR / 2;
  if (duration <= 24 * HOUR) return HOUR;
  if (duration <= 72 * HOUR) return 6 * HOUR;
  return 24 * HOUR;
}
export function filterEvents(events: MonitoringEvent[], filters: MonitoringFilters, start: number, end: number) {
  return events.filter((e) => {
    const time = Date.parse(e.time);
    return time >= start && time < end &&
      (filters.province === "all" || e.provinceId === filters.province) &&
      (filters.city === "all" || e.city === filters.city) &&
      (filters.eventType === "all" || e.event_type === filters.eventType) &&
      (filters.community === "all" || e.community === filters.community) &&
      (filters.subject === "all" || e.subject === filters.subject) &&
      (filters.severity === "all" || e.severity === filters.severity);
  });
}
export function eventSummary(events: MonitoringEvent[], previous: MonitoringEvent[]) {
  return {
    total: events.length,
    messages: events.reduce((sum, e) => sum + e.message_count, 0),
    provinces: new Set(events.map((e) => e.provinceId)).size,
    change: previous.length ? Math.round((events.length - previous.length) / previous.length * 100) : events.length ? null : 0,
  };
}
export function timelineBuckets(start: number, end: number, resolution: number, events: MonitoringEvent[]) {
  return Array.from({ length: Math.ceil((end - start) / resolution) }, (_, i) => {
    const from = start + i * resolution;
    const to = Math.min(end, from + resolution);
    return { start: from, end: to, count: events.filter((e) => Date.parse(e.time) >= from && Date.parse(e.time) < to).length };
  });
}