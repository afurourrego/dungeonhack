import { MONSTER_TYPES } from "./constants";
import { Monster } from "@/store/gameStore";

/**
 * Generate a random monster for combat
 */
export function generateMonster(): Monster {
  // Pick a random monster type
  const monsterConfig = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];

  // Roll HP within the range
  const [minHp, maxHp] = monsterConfig.hpRange;
  const hp = Math.floor(Math.random() * (maxHp - minHp + 1)) + minHp;

  return {
    name: monsterConfig.name,
    hp,
    maxHp: hp,
    attackRange: monsterConfig.attackRange,
    hitChance: monsterConfig.hitChance,
  };
}

/**
 * Roll a dice for attack (visual representation)
 */
export function rollDice(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
