import { describe, expect, it } from "vitest";
import { normalizeTo0To100 } from "./normalize";

describe("normalizeTo0To100", () => {
  it("normalizes common church planning scales", () => {
    expect(normalizeTo0To100(5, "likert_1_5")).toBe(100);
    expect(normalizeTo0To100(3, "likert_1_5")).toBe(50);
    expect(normalizeTo0To100(4, "zero_to_four")).toBe(100);
    expect(normalizeTo0To100(39, "ncd_dim_65")).toBe(60);
  });

  it("clamps out-of-range values", () => {
    expect(normalizeTo0To100(9, "likert_1_6")).toBe(100);
    expect(normalizeTo0To100(-10, "percent_0_100")).toBe(0);
  });
});
