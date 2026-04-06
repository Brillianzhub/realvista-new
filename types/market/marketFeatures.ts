// types/market.ts

export type MarketFeaturesPayload = {
  negotiable: 'yes' | 'slightly' | 'no';
  furnished: boolean;
  pet_friendly: boolean;
  parking_available: boolean;
  swimming_pool: boolean;
  garden: boolean;
  electricity_proximity: string;
  road_network: string;
  development_level: string;
  water_supply: boolean;
  security: boolean;
};

export type CreateMarketPropertyPayload = {
  features: MarketFeaturesPayload;
};

export type CreateMarketPropertyResponse = {
  message: string;
  market_property_id: number;
};
