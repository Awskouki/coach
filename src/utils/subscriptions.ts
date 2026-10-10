export type SubscriptionType = 'partner' | 'squad' | 'personal';

export const SUBSCRIPTION_PRICES: Record<SubscriptionType, number> = {
  partner: 450,
  squad: 600,
  personal: 800,
};

export const SUBSCRIPTION_LABELS: Record<SubscriptionType, string> = {
  partner: 'Partner Performance',
  squad: 'Small Squad Strength',
  personal: 'Personal Power',
};

/** Map legacy admin values and landing values to unified plan keys. */
export function normalizeSubscriptionType(type: string): SubscriptionType {
  switch (type) {
    case 'partner':
    case '3_months':
      return 'partner';
    case 'squad':
      return 'squad';
    case 'personal':
    case '6_months':
      return 'personal';
    default:
      return 'partner';
  }
}

export function getSubscriptionPrice(type: string): number {
  return SUBSCRIPTION_PRICES[normalizeSubscriptionType(type)];
}

export function getSubscriptionLabel(type: string): string {
  return SUBSCRIPTION_LABELS[normalizeSubscriptionType(type)];
}

export function formatSubscriptionDisplay(type: string): string {
  const key = normalizeSubscriptionType(type);
  return `${SUBSCRIPTION_LABELS[key]} — ${SUBSCRIPTION_PRICES[key]} TND/mois`;
}
