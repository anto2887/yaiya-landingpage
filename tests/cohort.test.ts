import { describe, expect, it } from "vitest";
import { trafficCohort } from "@/lib/cohort";

describe("trafficCohort", () => {
  it("is meta for an fbclid or a Meta utm_source", () => {
    expect(trafficCohort({ fbclid: "abc" })).toBe("meta");
    expect(trafficCohort({ utm_source: "Instagram" })).toBe("meta");
    expect(trafficCohort({ utm_source: "ig", referrer: "https://www.google.com/" })).toBe("meta");
  });
  it("is organic for a search or social referrer without UTMs", () => {
    expect(trafficCohort({ referrer: "https://www.google.co.uk/" })).toBe("organic");
    expect(trafficCohort({ referrer: "https://l.instagram.com/" })).toBe("organic");
    expect(trafficCohort({ referrer: "https://t.co/xyz" })).toBe("organic");
  });
  it("is direct with no UTMs and no referrer", () => {
    expect(trafficCohort({})).toBe("direct");
    expect(trafficCohort({ referrer: "  " })).toBe("direct");
  });
  it("is other for non-Meta UTMs or an unknown referrer", () => {
    expect(trafficCohort({ utm_source: "newsletter" })).toBe("other");
    expect(trafficCohort({ referrer: "https://someblog.example/post" })).toBe("other");
    // No accidental partial matches.
    expect(trafficCohort({ referrer: "https://notgoogle-mirror.example/" })).toBe("other");
  });
});
