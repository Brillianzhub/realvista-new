import api from './apiClient';

export interface HydratedUser {
  id: number;
  email: string;
  name: string;
  first_name: string;
  auth_provider: string;
  is_active: boolean;
  is_agent: boolean;
  is_premium: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  agent_id: number | null;
  referral_code: string;
  referrer_email: string | null;
  referred_users_count: number;
  total_referral_earnings: number;
  date_joined: string;
  profile: {
    id: number;
    avatar_url: string | null;
    phone_number: string | null;
    whatsapp_number: string | null;
    country_of_residence: string | null;
    state: string;
    city: string | null;
    street: string | null;
    house_number: string | null;
    postal_code: string | null;
    birth_date: string | null;
  } | null;
  preferences: {
    contact_by_email: boolean;
    contact_by_whatsapp: boolean;
    contact_by_phone: boolean;
  } | null;
}

/**
 * Fetch the full authenticated user profile from GET /api/users/me/
 * Call this after storing the access token in tokenStore — the
 * apiClient interceptor handles auth automatically.
 * Returns null if the request fails (token invalid, network error, etc.)
 */
export async function hydrateUser(): Promise<HydratedUser | null> {
  try {
    const { data } = await api.get('/api/users/me/');
    return {
      id:                      data.id,
      email:                   data.email,
      name:                    data.name ?? '',
      first_name:              data.first_name ?? '',
      auth_provider:           data.auth_provider ?? 'email',
      is_active:               data.is_active ?? true,
      is_agent:                data.is_agent ?? false,
      is_premium:              data.is_premium ?? false,
      is_email_verified:       data.is_email_verified ?? false,
      is_phone_verified:       data.is_phone_verified ?? false,
      is_identity_verified:    data.is_identity_verified ?? false,
      agent_id:                data.agent_id ?? null,
      referral_code:           data.referral_code ?? '',
      referrer_email:          data.referrer_email ?? null,
      referred_users_count:    data.referred_users_count ?? 0,
      total_referral_earnings: Number(data.total_referral_earnings ?? 0),
      date_joined:             data.date_joined ?? '',
      profile:                 data.profile ?? null,
      preferences:             data.preferences ?? null,
    };
  } catch (error) {
    console.error('[hydrateUser] Failed to fetch /api/users/me/', error);
    return null;
  }
}
