import type { RiderTier, TierConfiguration } from '../types/index.ts';

export const DEFAULT_TIER_CONFIGURATIONS: Record<RiderTier, TierConfiguration> = {
  bronze: {
    tier: 'bronze',
    minRating: 0.0,
    minWorkingHours: 0,
    minCompletedOrders: 0,
    basePayout: 40,
    basePay: 40,
    perKmRate: 12,
    surgeBonus: 10,
    tierIncentive: 0,
    tierIncentiveBonus: 0,
    orderMultiplier: 1.0,
    payoutMultiplier: 1.0,
    selfieIntervalMinutes: 90,
    selfieFrequencyHours: 1.5,
    selfieWindowMinutes: 10,
    priorityOrderDispatch: false
  },
  silver: {
    tier: 'silver',
    minRating: 4.6,
    minWorkingHours: 50,
    minCompletedOrders: 100,
    basePayout: 45,
    basePay: 45,
    perKmRate: 14,
    surgeBonus: 15,
    tierIncentive: 15,
    tierIncentiveBonus: 15,
    orderMultiplier: 1.05,
    payoutMultiplier: 1.05,
    selfieIntervalMinutes: 240,
    selfieFrequencyHours: 4.0,
    selfieWindowMinutes: 15,
    priorityOrderDispatch: true
  },
  gold: {
    tier: 'gold',
    minRating: 4.8,
    minWorkingHours: 150,
    minCompletedOrders: 300,
    basePayout: 55,
    basePay: 55,
    perKmRate: 16,
    surgeBonus: 20,
    tierIncentive: 30,
    tierIncentiveBonus: 30,
    orderMultiplier: 1.10,
    payoutMultiplier: 1.10,
    selfieIntervalMinutes: 0, // Duty start & duty end
    selfieFrequencyHours: 0,
    selfieWindowMinutes: 15,
    priorityOrderDispatch: true
  }
};

/**
 * Calculates qualified rider tier based on verified metrics:
 * 1. Customer rating
 * 2. Total verified active working hours (offline time excluded)
 * 3. Completed orders count (cancellations excluded)
 */
export function calculateRiderTier(
  rating: number,
  workingHours: number,
  completedOrders: number,
  configs: Record<RiderTier, TierConfiguration> = DEFAULT_TIER_CONFIGURATIONS
): RiderTier {
  const gold = configs.gold;
  if (
    rating >= gold.minRating &&
    workingHours >= gold.minWorkingHours &&
    completedOrders >= gold.minCompletedOrders
  ) {
    return 'gold';
  }

  const silver = configs.silver;
  if (
    rating >= silver.minRating &&
    workingHours >= silver.minWorkingHours &&
    completedOrders >= silver.minCompletedOrders
  ) {
    return 'silver';
  }

  return 'bronze';
}

/**
 * Computes tiered order payout breakdown:
 * - Bronze: Base ₹40 + ₹12/km + ₹10 surge + 100% tip (1.0x)
 * - Silver: Base ₹45 + ₹14/km + ₹15 surge + 100% tip + ₹15 Tier Incentive (1.05x)
 * - Gold: Base ₹55 + ₹16/km + ₹20 surge + 100% tip + ₹30 Tier Incentive (1.10x)
 */
export function calculateTierPayout(
  tier: RiderTier,
  distanceKm: number,
  isSurgeOrAmount: boolean | number,
  tip: number,
  configs: Record<RiderTier, TierConfiguration> = DEFAULT_TIER_CONFIGURATIONS
) {
  const cfg = configs[tier] || configs.bronze;
  const basePay = cfg.basePay ?? cfg.basePayout ?? 40;
  const distancePay = Math.round(distanceKm * cfg.perKmRate);
  const surgePay =
    typeof isSurgeOrAmount === 'number'
      ? isSurgeOrAmount
      : isSurgeOrAmount
      ? cfg.surgeBonus
      : 0;
  const tipPay = tip;
  const tierIncentive = cfg.tierIncentiveBonus ?? cfg.tierIncentive ?? 0;
  const multiplier = cfg.payoutMultiplier ?? cfg.orderMultiplier ?? 1.0;

  // Multiplier applies to delivery components (base + distance + surge)
  const coreSubtotal = basePay + distancePay + surgePay;
  const multipliedSubtotal = Math.round(coreSubtotal * multiplier);
  const totalPay = multipliedSubtotal + tipPay + tierIncentive;

  return {
    tier,
    basePay,
    baseFare: basePay + distancePay,
    distancePay,
    surgePay,
    surgeFare: surgePay,
    tipPay,
    tipAmount: tipPay,
    tierIncentive,
    tierIncentiveBonus: tierIncentive,
    multiplier,
    tierMultiplier: multiplier,
    payoutMultiplier: multiplier,
    totalPay,
    totalPayout: totalPay
  };
}
