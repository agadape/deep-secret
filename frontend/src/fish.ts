// Fish catalog and the packed layout written by DeepSecretGame._rollFish:
// tier bits 0-2 | species bits 3-4 | aura bit 5 | weight bits 8-15 | valid bit 16. packed == 0 is Sandal Jepit.

export const TIER = { BIASA: 0, LANGKA: 1, EPIK: 2, LEGENDA: 3, SECRET: 4 } as const;

export const TIERS = [
  { name: "Biasa", en: "Common", color: "#9fd8cf" },
  { name: "Langka", en: "Rare", color: "#4f8fe8" },
  { name: "Epik", en: "Epic", color: "#a77bff" },
  { name: "Legenda", en: "Legendary", color: "#f8b84a" },
  { name: "Secret", en: "Secret", color: "#48f0db" },
] as const;

const SPECIES: [string, string][][] = [
  [
    ["Teri Ngantuk", "Sleepy Anchovy"],
    ["Lele Galau", "Moody Catfish"],
    ["Mujair Kantoran", "Office Tilapia"],
    ["Bandeng Rebahan", "Lazy Milkfish"],
  ],
  [
    ["Kakap Sultan", "Sultan Snapper"],
    ["Kerapu Bucin", "Lovesick Grouper"],
    ["Tongkol Turbo", "Turbo Tuna"],
    ["Gurame Glamor", "Glam Gourami"],
  ],
  [
    ["Hiu Kalkulator", "Calculator Shark"],
    ["Pari Pesulap", "Magician Ray"],
    ["Belut Listrik Kosan", "Dorm Room Eel"],
    ["Napoleon Ngamuk", "Angry Wrasse"],
  ],
  [
    ["Naga Arwana", "Dragon Arowana"],
    ["Paus Disko", "Disco Whale"],
    ["Marlin Kilat", "Lightning Marlin"],
    ["Kraken Kecil", "Tiny Kraken"],
  ],
  [
    ["Raja Abyss", "Abyss King"],
    ["Ratu Palung", "Trench Queen"],
  ],
];

export type Fish = {
  id: bigint;
  valid: boolean;
  tier: number;
  species: number;
  aura: boolean;
  weight: number;
  price: bigint;
  state: number;
  name: string;
  en: string;
};

export function decodeFish(id: bigint, packed: bigint, price: bigint, state: number): Fish {
  const n = Number(packed);
  const valid = ((n >> 16) & 1) === 1;
  const tier = n & 7;
  const species = (n >> 3) & 3;
  const [name, en] = valid ? (SPECIES[tier]?.[species] ?? ["???", "???"]) : ["Sandal Jepit", "Flip-flop"];
  return { id, valid, tier, species, aura: ((n >> 5) & 1) === 1, weight: (n >> 8) & 255, price, state, name, en };
}

export const isSecret = (f: Fish) => f.valid && f.tier === TIER.SECRET;
