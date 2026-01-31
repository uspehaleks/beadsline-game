import { Boost } from '../shared/schema';
import { supabase } from './supabase';

// Default fallback values for prices
const DEFAULT_PRICES = {
  beads: {
    basePrice: 1,
    multiplier: 1,
  },
  life: {
    basePrice: 100,
    multiplier: 1,
  },
  boosts: {
    slowdown: 50,
    bomb: 75,
    rainbow: 100,
    rewind: 125,
    shield: 60,
    magnet: 80,
    laser: 90,
  },
};

// Type definitions
export type BeadPriceConfig = typeof DEFAULT_PRICES.beads;
export type LifePriceConfig = typeof DEFAULT_PRICES.life;
export type BoostPriceConfig = typeof DEFAULT_PRICES.boosts;

/**
 * Fetches bead pricing configuration from the database with fallback to defaults
 */
export async function getBeadPriceConfig(): Promise<BeadPriceConfig> {
  try {
    // Using Supabase client to fetch from game_config table
    const { data, error } = await supabase
      .from('game_config')
      .select('value')
      .eq('key', 'bead_prices')
      .single();

    if (error) {
      console.error('Error fetching bead price config:', error);
      return DEFAULT_PRICES.beads; // Fallback to default
    }

    if (data && data.value) {
      return {
        basePrice: data.value.basePrice || DEFAULT_PRICES.beads.basePrice,
        multiplier: data.value.multiplier || DEFAULT_PRICES.beads.multiplier,
      };
    }

    return DEFAULT_PRICES.beads;
  } catch (error) {
    console.error('Error fetching bead price config:', error);
    return DEFAULT_PRICES.beads; // Fallback to default
  }
}

/**
 * Fetches life pricing configuration from the database with fallback to defaults
 */
export async function getLifePriceConfig(): Promise<LifePriceConfig> {
  try {
    // Using Supabase client to fetch from game_config table
    const { data, error } = await supabase
      .from('game_config')
      .select('value')
      .eq('key', 'life_prices')
      .single();

    if (error) {
      console.error('Error fetching life price config:', error);
      return DEFAULT_PRICES.life; // Fallback to default
    }

    if (data && data.value) {
      return {
        basePrice: data.value.basePrice || DEFAULT_PRICES.life.basePrice,
        multiplier: data.value.multiplier || DEFAULT_PRICES.life.multiplier,
      };
    }

    return DEFAULT_PRICES.life;
  } catch (error) {
    console.error('Error fetching life price config:', error);
    return DEFAULT_PRICES.life; // Fallback to default
  }
}

/**
 * Fetches boost pricing configuration from the database with fallback to defaults
 */
export async function getBoostPriceConfig(): Promise<BoostPriceConfig> {
  try {
    // First try to get from game_config table
    const { data: configData, error: configError } = await supabase
      .from('game_config')
      .select('value')
      .eq('key', 'boost_prices')
      .single();

    if (!configError && configData && configData.value) {
      return {
        slowdown: configData.value.slowdown || DEFAULT_PRICES.boosts.slowdown,
        bomb: configData.value.bomb || DEFAULT_PRICES.boosts.bomb,
        rainbow: configData.value.rainbow || DEFAULT_PRICES.boosts.rainbow,
        rewind: configData.value.rewind || DEFAULT_PRICES.boosts.rewind,
        shield: configData.value.shield || DEFAULT_PRICES.boosts.shield,
        magnet: configData.value.magnet || DEFAULT_PRICES.boosts.magnet,
        laser: configData.value.laser || DEFAULT_PRICES.boosts.laser,
      };
    }

    // If not in game_config, try to get from the boosts table directly
    try {
      const { data: boostsData, error: boostsError } = await supabase
        .from('boosts')
        .select('type, price');

      if (!boostsError && boostsData && boostsData.length > 0) {
        const boostPrices: Record<string, number> = {};

        boostsData.forEach(boost => {
          boostPrices[boost.type] = boost.price;
        });

        return {
          slowdown: boostPrices.slowdown || DEFAULT_PRICES.boosts.slowdown,
          bomb: boostPrices.bomb || DEFAULT_PRICES.boosts.bomb,
          rainbow: boostPrices.rainbow || DEFAULT_PRICES.boosts.rainbow,
          rewind: boostPrices.rewind || DEFAULT_PRICES.boosts.rewind,
          shield: boostPrices.shield || DEFAULT_PRICES.boosts.shield,
          magnet: boostPrices.magnet || DEFAULT_PRICES.boosts.magnet,
          laser: boostPrices.laser || DEFAULT_PRICES.boosts.laser,
        };
      }
    } catch (dbError) {
      console.error('Error fetching boosts from database:', dbError);
    }

    return DEFAULT_PRICES.boosts;
  } catch (error) {
    console.error('Error fetching boost price config:', error);
    return DEFAULT_PRICES.boosts; // Fallback to default
  }
}

/**
 * Gets all pricing configurations at once
 */
export async function getAllPriceConfigs() {
  const [beadConfig, lifeConfig, boostConfig] = await Promise.all([
    getBeadPriceConfig(),
    getLifePriceConfig(),
    getBoostPriceConfig(),
  ]);
  
  return {
    beads: beadConfig,
    life: lifeConfig,
    boosts: boostConfig,
  };
}

/**
 * Updates bead pricing configuration in the database
 */
export async function updateBeadPriceConfig(config: BeadPriceConfig) {
  try {
    // Use API route to update the config
    const response = await fetch('/api/game-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'bead_prices',
        value: config,
        description: 'Bead pricing configuration',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update bead price config: ${response.statusText}`);
    }

    return { success: true, config };
  } catch (error) {
    console.error('Error updating bead price config:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Updates life pricing configuration in the database
 */
export async function updateLifePriceConfig(config: LifePriceConfig) {
  try {
    // Use API route to update the config
    const response = await fetch('/api/game-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'life_prices',
        value: config,
        description: 'Life pricing configuration',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update life price config: ${response.statusText}`);
    }

    return { success: true, config };
  } catch (error) {
    console.error('Error updating life price config:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Updates boost pricing configuration in the database
 */
export async function updateBoostPriceConfig(config: BoostPriceConfig) {
  try {
    // Use API route to update the config
    const response = await fetch('/api/game-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'boost_prices',
        value: config,
        description: 'Boost pricing configuration',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update boost price config: ${response.statusText}`);
    }

    return { success: true, config };
  } catch (error) {
    console.error('Error updating boost price config:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Gets the price for a specific boost type
 */
export async function getBoostPrice(boostType: keyof BoostPriceConfig): Promise<number> {
  const boostConfig = await getBoostPriceConfig();
  return boostConfig[boostType] || DEFAULT_PRICES.boosts[boostType] || 50;
}

/**
 * Gets the price for buying a life
 */
export async function getLifePrice(): Promise<number> {
  const lifeConfig = await getLifePriceConfig();
  return lifeConfig.basePrice;
}

/**
 * Calculates the price for buying multiple lives with potential multiplier
 */
export async function getMultipleLivesPrice(count: number): Promise<number> {
  const lifeConfig = await getLifePriceConfig();
  return Math.round(lifeConfig.basePrice * count * lifeConfig.multiplier);
}