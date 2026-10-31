/** Wall defence multiplier: factor^level (e.g. 1.03^20 ≈ 1.806 → +80.6 %). */
export function wallBonus(factorPerLevel: number, level: number): number {
  if (level < 0) throw new RangeError('level must be >= 0');
  return factorPerLevel ** level;
}

/** Bonus as a percentage increase, e.g. 1.806 → 80.6. */
export function wallBonusPercent(factorPerLevel: number, level: number): number {
  return (wallBonus(factorPerLevel, level) - 1) * 100;
}
