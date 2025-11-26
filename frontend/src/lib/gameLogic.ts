import {
  CardType,
  CARD_PROBABILITIES,
  TREASURE_REWARDS,
  POTION_TYPES,
  GAME_CONFIG,
  CardRevealState,
} from "./constants";

// Card interface
export interface GameCard {
  id: number;
  type: CardType;
  value: number; // Monster ATK or Treasure Gold
  revealed: CardRevealState;
}

// Game run result
export interface GameResult {
  success: boolean;
  cardsPlayed: GameCard[];
  monstersDefeated: number;
  treasureCollected: number;
  finalHP: number;
}

/**
 * Generate a random card
 */
export const generateCard = (id: number): GameCard => {
  const random = Math.random();

  let type: CardType;
  let value: number;

  if (random < CARD_PROBABILITIES.TRAP) {
    // 10% Trap
    type = CardType.TRAP;
    value = 1; // Always deals 1 damage
  } else if (random < CARD_PROBABILITIES.TRAP + CARD_PROBABILITIES.POTION) {
    // 10% Potion
    type = CardType.POTION;
    value = POTION_TYPES[Math.floor(Math.random() * POTION_TYPES.length)];
  } else if (random < CARD_PROBABILITIES.TRAP + CARD_PROBABILITIES.POTION + CARD_PROBABILITIES.TREASURE) {
    // 30% Treasure
    type = CardType.TREASURE;
    value = TREASURE_REWARDS[Math.floor(Math.random() * TREASURE_REWARDS.length)];
  } else {
    // 50% Monster
    type = CardType.MONSTER;
    value = 0; // Monster value is no longer used, combat is handled separately
  }

  return {
    id,
    type,
    value,
    revealed: CardRevealState.HIDDEN,
  };
};

/**
 * Generate a full deck for a run
 */
export const generateDeck = (): GameCard[] => {
  const deck: GameCard[] = [];

  for (let i = 0; i < GAME_CONFIG.CARDS_PER_RUN; i++) {
    deck.push(generateCard(i));
  }

  return deck;
};

/**
 * Resolve a card encounter
 * @returns Updated HP and result message
 */
export const resolveCard = (
  card: GameCard,
  playerDEF: number,
  currentHP: number
): {
  newHP: number;
  gold: number;
  message: string;
  defeated: boolean;
  hpLost: number;
  hpGained: number;
} => {
  let newHP = currentHP;
  let gold = 0;
  let message = "";
  let defeated = false;
  let hpLost = 0;
  let hpGained = 0;

  switch (card.type) {
    case CardType.MONSTER:
      if (playerDEF >= card.value) {
        message = `🛡️ You blocked the Monster (ATK ${card.value}) with your defense!`;
        defeated = true;
      } else {
        const damage = card.value - playerDEF;
        newHP -= damage;
        hpLost = damage;
        message = `💔 Monster (ATK ${card.value}) broke through your defense! You lose ${damage} HP.`;
      }
      break;

    case CardType.TREASURE:
      gold = card.value;
      message = `💎 You found ${card.value} gems!`;
      break;

    case CardType.TRAP:
      newHP -= 1;
      hpLost = 1;
      message = `🕸️ Trap triggered! You lose 1 HP.`;
      break;

    case CardType.POTION:
      if (card.value === 999) {
        // Full restore potion
        const hpRestored = GAME_CONFIG.BASIC_HP - currentHP;
        newHP = GAME_CONFIG.BASIC_HP;
        hpGained = hpRestored;
        message = `🧪 Full Restore Potion! HP fully restored (+${hpRestored} HP)!`;
      } else {
        // Small potion
        newHP = Math.min(currentHP + card.value, GAME_CONFIG.BASIC_HP);
        const actualRestore = newHP - currentHP;
        hpGained = actualRestore;
        message = `🧪 Small Potion! Restored ${actualRestore} HP.`;
      }
      break;
  }

  return { newHP, gold, message, defeated, hpLost, hpGained };
};

/**
 * Check if game is over (HP <= 0)
 */
export const isGameOver = (hp: number): boolean => {
  return hp <= 0;
};

/**
 * Calculate run statistics
 */
export const calculateRunStats = (
  cards: GameCard[],
  finalHP: number
): {
  monstersDefeated: number;
  treasuresFound: number;
  trapsTriggered: number;
  totalGold: number;
  success: boolean;
} => {
  let monstersDefeated = 0;
  let treasuresFound = 0;
  let trapsTriggered = 0;
  let totalGold = 0;

  cards.forEach((card) => {
    if (card.revealed === CardRevealState.RESOLVED) {
      switch (card.type) {
        case CardType.MONSTER:
          if (GAME_CONFIG.BASIC_DEF >= card.value) {
            monstersDefeated++;
          }
          break;
        case CardType.TREASURE:
          treasuresFound++;
          totalGold += card.value;
          break;
        case CardType.TRAP:
          trapsTriggered++;
          break;
      }
    }
  });

  const success = finalHP > 0;

  return {
    monstersDefeated,
    treasuresFound,
    trapsTriggered,
    totalGold,
    success,
  };
};

/**
 * Get card display info
 */
export const getCardDisplayInfo = (card: GameCard) => {
  switch (card.type) {
    case CardType.MONSTER:
      return {
        icon: "👹",
        title: "Monster",
        description: "",
        className: "card-monster",
      };
    case CardType.TREASURE:
      return {
        icon: "💎",
        title: "Treasure",
        description: `${card.value} Gems`,
        className: "card-treasure",
      };
    case CardType.TRAP:
      return {
        icon: "🕸️",
        title: "Trap",
        description: "-1 HP",
        className: "card-trap",
      };
    case CardType.POTION:
      return {
        icon: "🧪",
        title: "Potion",
        description: card.value === 999 ? "Full HP!" : `+${card.value} HP`,
        className: "card-treasure", // Usar mismo estilo que treasure (verde/positivo)
      };
    default:
      return {
        icon: "❓",
        title: "Unknown",
        description: "",
        className: "card-back",
      };
  }
};
