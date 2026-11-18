import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { HOUR, resolutionFor, filterEvents, monitoringDefaults, timelineBuckets, eventSummary, type MonitoringEvent } from "./monitoring";
const event: MonitoringEvent = { event_id: "a", event_type: "فراخوان", provinceId: "isfahan", province: "اصفهان", city: "اصفهان", lat: 32.6546, lng: 51.668, time: "2026-11-18T08:00:00Z", community: "بازنشستگان فولاد", subject: "اعتراض اقتصادی", message_count: 18, source_count: 7, severity: "high", intensity: 0.82 };
describe("monitoring time rules", () => {
  test("1 hour uses 5 minute steps", () => strictEqual(resolutionFor(HOUR), 5 * 60_000));
  test("6 hours uses 30 minute steps", () => strictEqual(resolutionFor(6 * HOUR), 30 * 60_000));
  test("24 hours uses 1 hour steps", () => strictEqual(resolutionFor(24 * HOUR), HOUR));
  test("3 days uses 6 hour steps", () => strictEqual(resolutionFor(72 * HOUR), 6 * HOUR));
  test("7 days uses 1 day steps", () => strictEqual(resolutionFor(168 * HOUR), 24 * HOUR));
  test("24 hour timeline has 24 buckets", () => strictEqual(timelineBuckets(0, 24 * HOUR, HOUR, []).length, 24));
  test("each event belongs to exactly one playback bucket", () => {
    const time = Date.parse(event.time);
    deepStrictEqual(timelineBuckets(time - HOUR, time + HOUR, HOUR, [event]).map((b) => b.count), [0, 1]);
  });
});
test("all seven event/time filters affect the result", () => {
  const time = Date.parse(event.time);
  strictEqual(filterEvents([event], monitoringDefaults, time, time + HOUR).length, 1);
  for (const key of ["province", "city", "eventType", "community", "subject", "severity"] as const) {
    strictEqual(filterEvents([event], { ...monitoringDefaults, [key]: "unmatched" }, time, time + HOUR).length, 0);
  }
  strictEqual(filterEvents([event], monitoringDefaults, time + 1, time + HOUR).length, 0);
});
test("summaries count events, messages, provinces and change", () => {
  deepStrictEqual(eventSummary([event, { ...event, event_id: "b" }], [event]), { total: 2, messages: 36, provinces: 1, change: 100 });
});