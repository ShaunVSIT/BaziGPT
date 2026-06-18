export interface ZodiacAnimal {
  key: string;
  en: string;
  emoji: string;
}

// Index 0 = Rat. Order follows the Chinese zodiac / Earthly Branch cycle.
const ANIMALS: ZodiacAnimal[] = [
  { key: "rat", en: "Rat", emoji: "🐀" },
  { key: "ox", en: "Ox", emoji: "🐂" },
  { key: "tiger", en: "Tiger", emoji: "🐅" },
  { key: "rabbit", en: "Rabbit", emoji: "🐇" },
  { key: "dragon", en: "Dragon", emoji: "🐉" },
  { key: "snake", en: "Snake", emoji: "🐍" },
  { key: "horse", en: "Horse", emoji: "🐎" },
  { key: "goat", en: "Goat", emoji: "🐐" },
  { key: "monkey", en: "Monkey", emoji: "🐒" },
  { key: "rooster", en: "Rooster", emoji: "🐓" },
  { key: "dog", en: "Dog", emoji: "🐕" },
  { key: "pig", en: "Pig", emoji: "🐖" },
];

/**
 * Zodiac animal for a (Gregorian) birth year. Note: the lunar new year boundary
 * means late-Jan/early-Feb births can fall in the prior animal's year — this is
 * a delightful hint, not the authoritative reading (the server reading is).
 */
export function zodiacFromYear(year: number): ZodiacAnimal {
  return ANIMALS[(((year - 4) % 12) + 12) % 12];
}

/**
 * The BaZi "double-hour" (時辰 shíchén) animal for a HH:MM birth time.
 * 12 two-hour branches, starting 23:00–01:00 = Rat. Always exact.
 */
export function shichenFromTime(time: string): ZodiacAnimal | null {
  if (!time || !/^\d{1,2}:\d{2}/.test(time)) return null;
  const hour = Number(time.split(":")[0]);
  if (Number.isNaN(hour)) return null;
  return ANIMALS[Math.floor(((hour + 1) % 24) / 2)];
}
