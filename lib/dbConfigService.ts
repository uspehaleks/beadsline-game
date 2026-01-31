import { storage, logDiagnostic } from '../server/storage';
import { Boost } from '../shared/schema';
import { withDbTransaction } from '../server/db';
import { gameConfig } from '../shared/schema';
import { eq } from 'drizzle-orm';

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
    const config = await storage.getGameConfig('bead_prices');
    
    if (config && config.value) {
      return {
        basePrice: config.value.basePrice || DEFAULT_PRICES.beads.basePrice,
        multiplier: config.value.multiplier || DEFAULT_PRICES.beads.multiplier,
      };
    }
    
    // Log that we're using default values
    await logDiagnostic('Using default bead price config', { 
      reason: 'No config found in database',
      defaultValue: DEFAULT_PRICES.beads 
    });
    
    return DEFAULT_PRICES.beads;
  } catch (error) {
    console.error('Error fetching bead price config:', error);
    await logDiagnostic('Error fetching bead price config', { error: error instanceof Error ? error.message : 'Unknown error' });
    return DEFAULT_PRICES.beads; // Fallback to default
  }
}

/**
 * Fetches life pricing configuration from the database with fallback to defaults
 */
export async function getLifePriceConfig(): Promise<LifePriceConfig> {
  try {
    const config = await storage.getGameConfig('life_prices');
    
    if (config && config.value) {
      return {
        basePrice: config.value.basePrice || DEFAULT_PRICES.life.basePrice,
        multiplier: config.value.multiplier || DEFAULT_PRICES.life.multiplier,
      };
    }
    
    // Log that we're using default values
    await logDiagnostic('Using default life price config', { 
      reason: 'No config found in database',
      defaultValue: DEFAULT_PRICES.life 
    });
    
    return DEFAULT_PRICES.life;
  } catch (error) {
    console.error('Error fetching life price config:', error);
    await logDiagnostic('Error fetching life price config', { error: error instanceof Error ? error.message : 'Unknown error' });
    return DEFAULT_PRICES.life; // Fallback to default
  }
}

/**
 * Fetches boost pricing configuration from the database with fallback to defaults
 */
export async function getBoostPriceConfig(): Promise<BoostPriceConfig> {
  try {
    // First try to get from game_config table
    const config = await storage.getGameConfig('boost_prices');
    
    if (config && config.value) {
      return {
        slowdown: config.value.slowdown || DEFAULT_PRICES.boosts.slowdown,
        bomb: config.value.bomb || DEFAULT_PRICES.boosts.bomb,
        rainbow: config.value.rainbow || DEFAULT_PRICES.boosts.rainbow,
        rewind: config.value.rewind || DEFAULT_PRICES.boosts.rewind,
        shield: config.value.shield || DEFAULT_PRICES.boosts.shield,
        magnet: config.value.magnet || DEFAULT_PRICES.boosts.magnet,
        laser: config.value.laser || DEFAULT_PRICES.boosts.laser,
      };
    }
    
    // If not in game_config, try to get from the boosts table directly
    try {
      const boosts = await storage.getBoosts();
      if (boosts && boosts.length > 0) {
        const boostPrices: Record<string, number> = {};
        
        boosts.forEach(boost => {
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
    
    // Log that we're using default values
    await logDiagnostic('Using default boost price config', { 
      reason: 'No config found in database',
      defaultValue: DEFAULT_PRICES.boosts 
    });
    
    return DEFAULT_PRICES.boosts;
  } catch (error) {
    console.error('Error fetching boost price config:', error);
    await logDiagnostic('Error fetching boost price config', { error: error instanceof Error ? error.message : 'Unknown error' });
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
    await storage.setGameConfig({
      key: 'bead_prices',
      value: config,
      description: 'Bead pricing configuration',
    });
    
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
    await storage.setGameConfig({
      key: 'life_prices',
      value: config,
      description: 'Life pricing configuration',
    });
    
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
    await storage.setGameConfig({
      key: 'boost_prices',
      value: config,
      description: 'Boost pricing configuration',
    });
    
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