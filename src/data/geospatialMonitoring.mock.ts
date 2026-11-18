import { MOCK_CITIES, MOCK_PROVINCES } from "./situationRoom.mock";
import type { MonitoringEvent } from "@/lib/monitoring";

// A fixed, labeled demo clock keeps playback and comparisons reproducible.
export const MONITORING_DEMO_END = "2026-11-18T11:50:00+03:30";
const communities = ["کارگران", "فرهنگیان", "بازنشستگان فولاد", "دانشجویان", "پرستاران"];
const subjects = ["مطالبات معیشتی", "حقوق و دستمزد", "مطالبات اجتماعی", "آموزش", "خدمات درمانی"];
const eventTypes = ["فراخوان", "تجمع", "اعتراض", "گزارش", "گفت‌وگو"];
export const MONITORING_EVENTS: MonitoringEvent[] = MOCK_PROVINCES.flatMap((p, pi) => {
  const cities = MOCK_CITIES.filter((c) => c.provinceId === p.id && c.coord);
  return Array.from({ length: 12 }, (_, i) => {
    const city = cities[i % cities.length];
    const [lng, lat] = city?.coord ?? [51.39, 35.69];
    const ageMinutes = i === 0 ? 3 + pi % 24 : i === 1 ? 65 + pi * 8 : (i - 1) * 780 + pi * 11;
    const intensity = (35 + (pi * 17 + i * 13) % 62) / 100;
    return {
      event_id: `geo-${p.id}-${i}`, provinceId: p.id, province: p.name,
      city: city?.name ?? p.name, lng, lat,
      time: new Date(Date.parse(MONITORING_DEMO_END) - ageMinutes * 60_000).toISOString(),
      event_type: eventTypes[(pi + i) % eventTypes.length],
      community: communities[(pi + i) % communities.length],
      subject: subjects[(pi * 2 + i) % subjects.length],
      message_count: 8 + (pi * 7 + i * 11) % 64,
      source_count: 2 + (pi + i * 3) % 14,
      severity: intensity >= 0.75 ? "high" : intensity >= 0.5 ? "medium" : "low",
      intensity,
    };
  });
});