export type SourceScale =
  | "likert_1_5"
  | "likert_1_6"
  | "zero_to_four"
  | "zero_to_one"
  | "ncd_dim_65"
  | "percent_0_100";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function normalizeTo0To100(value: number, scale: SourceScale): number {
  if (!Number.isFinite(value)) return 0;

  switch (scale) {
    case "likert_1_5":
      return round1(((clamp(value, 1, 5) - 1) / 4) * 100);
    case "likert_1_6":
      return round1(((clamp(value, 1, 6) - 1) / 5) * 100);
    case "zero_to_four":
      return round1((clamp(value, 0, 4) / 4) * 100);
    case "zero_to_one":
      return round1(clamp(value, 0, 1) * 100);
    case "ncd_dim_65":
      return round1((clamp(value, 0, 65) / 65) * 100);
    case "percent_0_100":
      return round1(clamp(value, 0, 100));
  }
}

export function mean0To100(values: number[]): number | null {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) return null;
  return round1(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}
