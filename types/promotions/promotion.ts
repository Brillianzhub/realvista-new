export type Currency = 'NGN' | 'EUR' | 'USD';

export interface ReferralPromotion {
  id: number;
  name: string;
  code: string;
  reward_amount: string; // kommt als string vom Backend
  currency: Currency;
}

export interface ActiveReferralPromotionResponse {
  active: boolean;
  promotion?: ReferralPromotion;
  message?: string;
  error?: string;
}
