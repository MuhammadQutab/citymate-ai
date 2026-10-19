import { describe, expect, it } from "vitest";
import { formatStraightLine, straightLineMeters } from "./distance";

describe("straightLineMeters", () => {
  it("is zero for identical points", () => {
    expect(straightLineMeters({ lat: 33.6844, lon: 73.0479 }, { lat: 33.6844, lon: 73.0479 })).toBe(0);
  });

  it("matches the known Islamabad → Kotli great-circle distance (~81 km)", () => {
    const d = straightLineMeters({ lat: 33.6844, lon: 73.0479 }, { lat: 33.5156, lon: 73.9019 });
    expect(d / 1000).toBeGreaterThan(80);
    expect(d / 1000).toBeLessThan(85);
  });
});

describe("formatStraightLine", () => {
  it("always labels the distance as straight-line", () => {
    expect(formatStraightLine(20)).toContain("straight line");
    expect(formatStraightLine(456)).toBe("≈ 460 m away (straight line)");
    expect(formatStraightLine(2345)).toBe("≈ 2.3 km away (straight line)");
    expect(formatStraightLine(23456)).toBe("≈ 23 km away (straight line)");
  });

  it("handles invalid input honestly", () => {
    expect(formatStraightLine(Number.NaN)).toBe("Distance unknown");
  });
});
